import { Request, Response } from 'express';
import { VideoModel } from '../models/video.js';
import { refreshDownloadUrl } from '../services/oneDriveService.js';
import { CreateVideoDTO } from '../types/video';

export const videoController = {
  create(req: Request<{}, {}, CreateVideoDTO>, res: Response) {
    const { onedriveId, ownerId, downloadUrl } = req.body;
    
    try {
      const id = VideoModel.create({ onedriveId, ownerId, downloadUrl });
      res.status(201).json({ id });
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ error: 'Failed to create video entry' });
    }
  },

  async getUrl(req: Request<{ id: string }, {}, {}, { token?: string }>, res: Response) {
    const { id } = req.params;
    const { token } = req.query;
    
    try {
      const video = VideoModel.findById(id);
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      const now = new Date();
      const expiry = new Date(video.url_expiry!);
      
      if (now < expiry) {
        return res.json({ url: video.download_url });
      }
      
      if (!token) {
        return res.status(401).json({ error: 'Token required for URL refresh' });
      }
      
      const newUrl = await refreshDownloadUrl(video.onedrive_id, token);
      VideoModel.updateUrl(id, newUrl);
      
      res.json({ url: newUrl });
    } catch (error) {
      console.error('Error getting video:', error);
      res.status(500).json({ error: 'Failed to get video URL' });
    }
  }
};