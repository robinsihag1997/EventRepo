const Fastify = require('fastify');
const multipart = require('@fastify/multipart');
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');
const fastifyStatic = require('@fastify/static');

const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');

const fastify = Fastify({
  logger: true
});

// ====================================
// CONFIG
// ====================================

const PORT = 3000;

const UPLOAD_DIR = path.join(
  __dirname,
  'uploads'
);

const DB_FILE = path.join(
  __dirname,
  'db.json'
);

// ====================================
// CREATE FOLDERS
// ====================================

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, '[]');
}

// ====================================
// JSON DATABASE
// ====================================

function readDB() {

  const raw = fs.readFileSync(
    DB_FILE,
    'utf8'
  );

  return JSON.parse(raw);
}

function writeDB(data) {

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  );
}

// ====================================
// PLUGINS
// ====================================

fastify.register(cors, {
  origin: '*'
});

fastify.register(multipart, {
  limits: {
    fileSize: 1 * 1024 * 1024
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

fastify.register(fastifyStatic, {
  root: UPLOAD_DIR,
  prefix: '/uploads/'
});

// ====================================
// HEALTH
// ====================================

fastify.get('/', async () => {

  return {
    ok: true
  };
});

// ====================================
// UPLOAD API
// ====================================

fastify.post('/upload', async (request, reply) => {

  try {

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({
        error: 'File required'
      });
    }

    const name = data.fields.name?.value;

    if (!name || name.length < 2) {

      return reply.status(400).send({
        error: 'Valid name required'
      });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(data.mimetype)) {

      return reply.status(400).send({
        error: 'Invalid image type'
      });
    }

    const ext = data.filename
      .split('.')
      .pop();

    const filename =
      `${uuidv4()}.${ext}`;

    const filepath = path.join(
      UPLOAD_DIR,
      filename
    );

    // SAVE FILE

    await new Promise((resolve, reject) => {

      const stream = fs.createWriteStream(
        filepath
      );

      data.file.pipe(stream);

      stream.on('finish', resolve);

      stream.on('error', reject);

    });

    // SAVE TO DB

    const uploads = readDB();

    uploads.push({
      id: uuidv4(),
      name,
      image: filename,
      createdAt: new Date().toISOString()
    });

    writeDB(uploads);

    return {
      success: true
    };

  } catch (err) {

    console.error(err);

    return reply.status(500).send({
      error: 'Upload failed'
    });
  }
});

// ====================================
// GET IMAGES
// ====================================

fastify.get('/images', async () => {

  const uploads = readDB();

  return uploads
    .reverse()
    .slice(0, 5000)
    .map(item => ({
      id: item.id,
      name: item.name,
      image:
        `http://localhost:3000/uploads/${item.image}`
    }));
});

// ====================================
// START SERVER
// ====================================

fastify.listen({
  port: PORT,
  host: '0.0.0.0'
});