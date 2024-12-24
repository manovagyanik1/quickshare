import { db } from './index.js';

// Initialize database tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      onedrive_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      download_url TEXT,
      url_expiry TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
} 