import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import path from 'path';
import { pathToFileURL } from 'url';
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

const normalizeImagePath = (value) => {
  const imagePath = value?.trim();

  if (!imagePath) {
    return null;
  }

  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath;
  }

  if (imagePath.startsWith('public/images/')) {
    return `/${imagePath.replace(/^public\//, '')}`;
  }

  if (imagePath.startsWith('src/assets/')) {
    return `/images/${path.basename(imagePath)}`;
  }

  if (imagePath.startsWith('images/')) {
    return `/${imagePath}`;
  }

  return imagePath;
};

const normalizeSortOrder = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.trunc(numericValue);
};

const legacyClientReviews = [
  {
    name: 'Gaurav Bhalani',
    quote:
      'Amazing design, quality work and best execution. Best interior designer in Rajkot. They designed exactly as per requirement and budget.',
    rating: 5
  },
  {
    name: 'Changela & Associates',
    quote: 'This was my second time and it is wonderful to work with, very professional and very accommodating to the client.',
    rating: 5
  },
  {
    name: 'TUSHAR WRELTT',
    quote: 'Interior designing is innovative and feels good for a long time. Truly value for money service.',
    rating: 5
  },
  {
    name: 'Ruchit Sherathiya',
    quote: 'They have unique designs. On-time, dedicated and punctual execution with very creative ideas.',
    rating: 5
  },
  {
    name: 'Jignesh Makawana',
    quote: 'They understood expectations and budget and gave their best shots. Creative, trendy and impressive design.',
    rating: 5
  },
  {
    name: 'Mehul Maniar',
    quote: 'Best Designing, Best Interior Solutions, Very Responsive and more than value for money.',
    rating: 5
  }
];

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS client_reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
      photo_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const review of legacyClientReviews) {
    await pool.query(
      `
        DELETE FROM client_reviews
        WHERE name = $1 AND quote = $2
      `,
      [review.name, review.quote]
    );
  }
};

app.use(cors());
app.use(express.json());

app.use('/images', express.static('public/images'));
app.use(express.static(distPath));

let databaseReady;

const ensureDatabase = async (_req, _res, next) => {
  try {
    databaseReady ??= initializeDatabase();
    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
};

app.use('/api', ensureDatabase);

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

app.get('/api/reviews', async (_req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, quote, rating, photo_url, sort_order, created_at
        FROM client_reviews
        ORDER BY sort_order ASC, id ASC
      `
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch reviews.'
    });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { name, quote, rating, photoUrl, sortOrder } = req.body ?? {};

  if (!name || !quote) {
    return res.status(400).json({
      ok: false,
      message: 'Reviewer name and review text are required.'
    });
  }

  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      ok: false,
      message: 'Rating must be a whole number from 1 to 5.'
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO client_reviews (name, quote, rating, photo_url, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, quote, rating, photo_url, sort_order, created_at
      `,
      [
        name.trim(),
        quote.trim(),
        numericRating,
        normalizeImagePath(photoUrl),
        normalizeSortOrder(sortOrder)
      ]
    );

    return res.status(201).json({
      ok: true,
      message: 'Review saved successfully.',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to save review.'
    });
  }
});

app.put('/api/reviews/:id', async (req, res) => {
  const { name, quote, rating, photoUrl, sortOrder } = req.body ?? {};

  if (!name || !quote) {
    return res.status(400).json({
      ok: false,
      message: 'Reviewer name and review text are required.'
    });
  }

  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      ok: false,
      message: 'Rating must be a whole number from 1 to 5.'
    });
  }

  try {
    const result = await pool.query(
      `
        UPDATE client_reviews
        SET name = $1,
          quote = $2,
          rating = $3,
          photo_url = $4,
          sort_order = $5
        WHERE id = $6
        RETURNING id, name, quote, rating, photo_url, sort_order, created_at
      `,
      [
        name.trim(),
        quote.trim(),
        numericRating,
        normalizeImagePath(photoUrl),
        normalizeSortOrder(sortOrder),
        req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Review was not found.'
      });
    }

    return res.json({
      ok: true,
      message: 'Review updated successfully.',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to update review.'
    });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM client_reviews WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Review was not found.'
      });
    }

    return res.json({
      ok: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to delete review.'
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
        normalizeImagePath(imageUrl),
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
      [normalizeImagePath(imageUrl), quote.trim()]
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
    return res.status(404).json({
      ok: false,
      message: 'API route was not found.'
    });
  }

  return res.sendFile(path.join(distPath, 'index.html'));
});

app.use((error, req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return next(error);
  }

  console.error('API error:', error);
  return res.status(500).json({
    ok: false,
    message: 'API server failed to start.'
  });
});

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  databaseReady = initializeDatabase();

  databaseReady
    .then(() => {
      app.listen(port, () => {
        console.log(`API server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

export default app;
