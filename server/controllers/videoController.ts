import { Request, Response } from 'express';
import { VideoModel } from '../models/video';
import { oneDriveService } from '../services/oneDriveService';

export const videoController = {
  async create(req: Request, res: Response) {
    try {
      const { onedriveId, ownerId, downloadUrl } = req.body;
      const id = VideoModel.create({ onedriveId, ownerId, downloadUrl });
      res.status(201).json({ id });
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  },

  async getUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { token } = req.query;
      
      const video = VideoModel.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const now = new Date();
      const expiry = new Date(video.url_expiry);
      
      if (now < expiry) {
        return res.json({ url: video.download_url });
      }

      if (!token) {
        return res.status(401).json({ error: 'Token required for URL refresh' });
      }

      const newUrl = await oneDriveService.getVideoDetails(video.onedrive_id, token as string);
      VideoModel.updateUrl(id, newUrl.downloadUrl);
      
      res.json({ url: newUrl.downloadUrl });
    } catch (error) {
      console.error('Error getting video:', error);
      res.status(500).json({ error: 'Failed to get video URL' });
    }
  }
};