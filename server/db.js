import initSqlJs from 'sql.js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'database.sqlite');

let db;

export async function initDb() {
  try {
    const SQL = await initSqlJs();
    
    // Try to load existing database
    try {
      const data = await fs.readFile(DB_PATH);
      db = new SQL.Database(data);
    } catch {
      // Create new database if file doesn't exist
      db = new SQL.Database();
    }

    // Create videos table
    db.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        onedrive_id TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        download_url TEXT,
        url_expiry DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_onedrive_id ON videos(onedrive_id);
      CREATE INDEX IF NOT EXISTS idx_owner_id ON videos(owner_id);
    `);

    // Save initial database
    await saveDb();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Save database to file
async function saveDb() {
  if (!db) return;
  const data = db.export();
  await fs.writeFile(DB_PATH, Buffer.from(data));
}

// Get database instance
export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return {
    prepare: (sql) => ({
      run: (...params) => {
        db.run(sql, params);
        saveDb();
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    }),
    exec: (sql) => {
      db.exec(sql);
      saveDb();
    }
  };
}

// Ensure database is saved before exit
process.on('exit', () => {
  if (db) {
    try {
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    } catch (error) {
      console.error('Failed to save database on exit:', error);
    }
  }
});