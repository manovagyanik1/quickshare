import { db } from '../config/database';
import { nanoid } from 'nanoid';
import { Video, CreateVideoDTO } from '../types/video';

export class VideoModel {
  static initTable(): void {
    console.log('Initializing videos table...');
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
    console.log('Videos table initialized');
  }

  static create({ onedriveId, ownerId, downloadUrl }: CreateVideoDTO): string {
    console.log('Creating video:', { onedriveId, ownerId, downloadUrl });
    const id = nanoid();
    const urlExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    try {
      const stmt = db.prepare(`
        INSERT INTO videos (id, onedrive_id, owner_id, download_url, url_expiry)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(id, onedriveId, ownerId, downloadUrl, urlExpiry);
      console.log('Video created with ID:', id);
      return id;
    } catch (error) {
      console.error('Error creating video in database:', error);
      throw error;
    }
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