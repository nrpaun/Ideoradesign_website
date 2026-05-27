import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const app = express();
const port = Number(process.env.PORT || 5000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'ideora_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
      }
);

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      phone VARCHAR(80) NOT NULL,
      email VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS homepage_images (
      id SERIAL PRIMARY KEY,
      image_url TEXT NOT NULL,
      quote TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_images (
      id SERIAL PRIMARY KEY,
      category_slug VARCHAR(80) NOT NULL,
      title VARCHAR(160) NOT NULL,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
};

app.use(cors());
app.use(express.json());

app.use('/images', express.static('public/images'));
app.use(express.static(distPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, message: 'API and database are connected.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database connection failed.' });
  }
});

app.get('/api/contacts', async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, phone, email, message, created_at
        FROM contacts
        ORDER BY created_at DESC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch contacts.'
    });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { name, phone, email, message } = req.body ?? {};

  if (!name || !phone || !email || !message) {
    return res.status(400).json({
      ok: false,
      message: 'Name, phone, email, and message are required.'
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO contacts (name, phone, email, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `,
      [name.trim(), phone.trim(), email.trim(), message.trim()]
    );

    return res.status(201).json({
      ok: true,
      message: 'Your message was saved successfully.',
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to save your message. Please try again.'
    });
  }
});

app.get('/api/project-images', async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, category_slug, title, image_url, sort_order, created_at
        FROM project_images
        ORDER BY category_slug ASC, sort_order ASC, id ASC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project images:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch project images.'
    });
  }
});

app.post('/api/project-images', async (req, res) => {
  const { categorySlug, title, imageUrl, sortOrder } = req.body ?? {};

  if (!categorySlug || !title || !imageUrl) {
    return res.status(400).json({
      ok: false,
      message: 'Category, title, and image URL are required.'
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO project_images (category_slug, title, image_url, sort_order)
        VALUES ($1, $2, $3, $4)
        RETURNING id, category_slug, title, image_url, sort_order, created_at
      `,
      [
        categorySlug.trim(),
        title.trim(),
        imageUrl.trim(),
        Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0
      ]
    );

    return res.status(201).json({
      ok: true,
      message: 'Project image saved successfully.',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving project image:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to save project image.'
    });
  }
});

app.delete('/api/project-images/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM project_images WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Project image was not found.'
      });
    }

    return res.json({
      ok: true,
      message: 'Project image deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting project image:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to delete project image.'
    });
  }
});

app.get('/api/home-images', async (req, res) => {
  console.log("🔥 /api/home-images hit");

  try {
    const result = await pool.query(
      'SELECT * FROM homepage_images ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Failed to fetch images' });
  }
});

app.post('/api/home-images', async (req, res) => {
  const { imageUrl, quote } = req.body ?? {};

  if (!imageUrl || !quote) {
    return res.status(400).json({
      ok: false,
      message: 'Image URL and quote are required.'
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO homepage_images (image_url, quote)
        VALUES ($1, $2)
        RETURNING id, image_url, quote
      `,
      [imageUrl.trim(), quote.trim()]
    );

    return res.status(201).json({
      ok: true,
      message: 'Homepage image saved successfully.',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving homepage image:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to save homepage image.'
    });
  }
});

app.delete('/api/home-images/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM homepage_images WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Homepage image was not found.'
      });
    }

    return res.json({
      ok: true,
      message: 'Homepage image deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting homepage image:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to delete homepage image.'
    });
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(distPath, 'index.html'));
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
