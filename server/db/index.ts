import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/data.db'  // Use /tmp for Vercel
  : path.join(process.cwd(), 'data.db');

const db = new Database(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Create tables if they don't exist
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

export { db }; 