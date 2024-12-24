import { db } from '../config/database.js';
import { nanoid } from 'nanoid';

export class Video {
  static initTable() {
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
  }

  static create({ onedriveId, ownerId, downloadUrl }) {
    const id = nanoid();
    const urlExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    const stmt = db.prepare(`
      INSERT INTO videos (id, onedrive_id, owner_id, download_url, url_expiry)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, onedriveId, ownerId, downloadUrl, urlExpiry);
    return id;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
    return stmt.get(id);
  }

  static updateUrl(id, downloadUrl) {
    const urlExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    
    const stmt = db.prepare(`
      UPDATE videos 
      SET download_url = ?, url_expiry = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(downloadUrl, urlExpiry, id);
  }
}