require('dotenv').config();
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
});

const s3Client = new S3Client({ region: AWS_REGION });

// ====================================
// MIDDLEWARE / PLUGINS
// ====================================

fastify.register(cors, {
  origin: '*'
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
  try {
    const result = await pool.query(
      'SELECT id, name, s3_key, created_at FROM uploads ORDER BY created_at DESC'
    );

    const images = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${row.s3_key}`,
      createdAt: row.created_at
    }));

    return images;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch images' });
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

    const uploads = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${row.s3_key}`,
      createdAt: row.created_at
    }));

    return uploads;
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Failed to fetch admin uploads' });
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