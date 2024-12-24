import { db } from '../db/index.js';
import { nanoid } from 'nanoid';

export const VideoModel = {
  initTable() {
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
  },

  create({ onedriveId, ownerId, downloadUrl }) {
    const stmt = db.prepare(`
      INSERT INTO videos (id, onedrive_id, owner_id, download_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const id = nanoid();
    stmt.run(id, onedriveId, ownerId, downloadUrl);
    return id;
  },

  findById(id) {
    // First try to find by primary id
    const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
    let video = stmt.get(id);

    // If not found, try to find by onedrive_id
    if (!video) {
      const onedriveStmt = db.prepare('SELECT * FROM videos WHERE onedrive_id = ?');
      video = onedriveStmt.get(id);
    }

    return video;
  },

  updateUrl(id, downloadUrl) {
    const urlExpiry = new Date(Date.now() + 3600000).toISOString();
    
    const stmt = db.prepare(`
      UPDATE videos 
      SET download_url = ?, url_expiry = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(downloadUrl, urlExpiry, id);
  }
}; 