import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/data.db'  // Use /tmp for Vercel
  : join(dirname(__dirname), 'data.db');

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