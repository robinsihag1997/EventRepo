require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const rateLimit = require('@fastify/rate-limit');
const { Pool } = require('pg');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const fastify = Fastify({
  logger: true
});

// ====================================
// CONFIG
// ====================================

const {
  PORT = 3000,
  AWS_REGION,
  AWS_BUCKET,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  JWT_SECRET
} = process.env;

// ====================================
// DATABASE & S3 CLIENTS
// ====================================

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

const s3Client = new S3Client({ region: AWS_REGION });

// ====================================
// MIDDLEWARE / PLUGINS
// ====================================

fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Admin Auth Middleware
const authenticateAdmin = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    request.admin = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
};

// ====================================
// HEALTH
// ====================================

fastify.get('/', async () => {
  return { ok: true, service: 'Event Platform API' };
});

// ====================================
// API 1: Generate Signed Upload URL
// ====================================

fastify.post('/generate-upload-url', async (request, reply) => {
  const { name, contentType } = request.body;

  // Validation
  if (!name || name.trim().length < 2) {
    return reply.status(400).send({ error: 'Valid name required (min 2 chars)' });
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(contentType)) {
    return reply.status(400).send({ error: 'Invalid image type. Allowed: jpeg, jpg, png' });
  }

  try {
    const id = uuidv4();
    const ext = contentType.split('/')[1];
    const s3Key = `uploads/${id}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return {
      id,
      uploadUrl,
      s3Key
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to generate upload URL' });
  }
});

// ====================================
// API 2: Save Upload Metadata
// ====================================

fastify.post('/save-upload', async (request, reply) => {
  const { id, name, s3Key } = request.body;

  if (!id || !name || !s3Key) {
    return reply.status(400).send({ error: 'Missing required fields' });
  }

  try {
    await pool.query(
      'INSERT INTO uploads (id, name, s3_key) VALUES ($1, $2, $3)',
      [id, name, s3Key]
    );

    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to save metadata' });
  }
});

// ====================================
// API 3: Get Images
// ====================================

fastify.get('/images', async (request, reply) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch images that haven't been sent yet
    const result = await client.query(
      'SELECT id, name, s3_key, created_at FROM uploads WHERE is_sent = FALSE ORDER BY created_at ASC'
    );

    if (result.rows.length === 0) {
      await client.query('COMMIT');
      return [];
    }

    // 2. Mark these images as sent
    const ids = result.rows.map(r => r.id);
    await client.query(
      'UPDATE uploads SET is_sent = TRUE WHERE id = ANY($1)',
      [ids]
    );

    await client.query('COMMIT');

    // 3. Generate signed URLs for the newly sent images
    const images = await Promise.all(
      result.rows.map(async (row) => {
        const command = new GetObjectCommand({
          Bucket: AWS_BUCKET,
          Key: row.s3_key,
        });

        const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
          id: row.id,
          name: row.name,
          imageUrl,
          createdAt: row.created_at
        };
      })
    );

    return images;
  } catch (err) {
    await client.query('ROLLBACK');
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch new images' });
  } finally {
    client.release();
  }
});

// ====================================
// API 4: Admin Login
// ====================================

fastify.post('/admin/login', async (request, reply) => {
  const { username, password } = request.body;

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    return { token };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Login failed' });
  }
});

// ====================================
// PROTECTED ADMIN APIs
// ====================================

fastify.get('/admin/uploads', { preHandler: [authenticateAdmin] }, async (request, reply) => {
  try {
    const result = await pool.query(
      'SELECT id, name, s3_key, created_at FROM uploads ORDER BY created_at DESC'
    );

    const uploads = await Promise.all(
      result.rows.map(async (row) => {
        const command = new GetObjectCommand({
          Bucket: AWS_BUCKET,
          Key: row.s3_key,
        });

        const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
          id: row.id,
          name: row.name,
          imageUrl,
          createdAt: row.created_at
        };
      })
    );

    return uploads;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch admin uploads' });
  }
});

fastify.delete('/admin/uploads/:id', { preHandler: [authenticateAdmin] }, async (request, reply) => {
  const { id } = request.params;

  try {
    // 1. Get the s3_key from DB
    const result = await pool.query('SELECT s3_key FROM uploads WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'Upload not found' });
    }
    const { s3_key } = result.rows[0];

    // 2. Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: AWS_BUCKET,
      Key: s3_key,
    });
    await s3Client.send(deleteCommand);

    // 3. Delete from DB
    await pool.query('DELETE FROM uploads WHERE id = $1', [id]);

    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to delete upload' });
  }
});

// ====================================
// API 5: Unity Upload & QR Link Generation
// ====================================

fastify.post('/unity/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: 'No file uploaded' });
  }

  try {
    const id = uuidv4();
    const filename = data.filename;
    const ext = filename.split('.').pop() || 'jpg';
    const s3Key = `unity-uploads/${id}.${ext}`;

    const uploadParams = {
      Bucket: AWS_BUCKET,
      Key: s3Key,
      Body: await data.toBuffer(),
      ContentType: data.mimetype
    };

    // 1. Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // 2. Calculate expiry: End of May 16, 2026
    const targetDate = new Date('2026-05-17T00:00:00Z');
    const now = new Date();
    // Calculate seconds remaining, default to 1 hour if target has passed
    const secondsRemaining = Math.max(Math.floor((targetDate - now) / 1000), 3600); 

    // 3. Generate Long-Term Signed URL for the QR code
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET,
      Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: secondsRemaining });

    return {
      success: true,
      id,
      downloadUrl
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to upload and generate download URL' });
  }
});

// ====================================
// START SERVER
// ====================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();