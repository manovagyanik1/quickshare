import { db } from '../config/database';
import { nanoid } from 'nanoid';
import { Video, CreateVideoDTO } from '../types/video';

export class VideoModel {
  static initTable(): void {
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

  static create(data: CreateVideoDTO): string {
    const id = nanoid();
    const urlExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    const stmt = db.prepare(`
      INSERT INTO videos (id, onedrive_id, owner_id, download_url, url_expiry)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.onedriveId, data.ownerId, data.downloadUrl, urlExpiry);
    return id;
  }

  static findById(id: string): Video | undefined {
    const stmt = db.prepare('SELECT * FROM videos WHERE id = ?');
    return stmt.get(id) as Video | undefined;
  }

  static updateUrl(id: string, downloadUrl: string): void {
    const urlExpiry = new Date(Date.now() + 3600000).toISOString();
    
    const stmt = db.prepare(`
      UPDATE videos 
      SET download_url = ?, url_expiry = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(downloadUrl, urlExpiry, id);
  }
}