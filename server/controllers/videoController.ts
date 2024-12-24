import { Request, Response } from 'express';
import { VideoModel } from '../models/video';
import { oneDriveService } from '../services/oneDriveService';
import { Video } from '../types/video';

interface VideoController {
  create(req: Request, res: Response): Promise<void | Response>;
  getUrl(req: Request, res: Response): Promise<void | Response>;
  getVideo(req: Request, res: Response): Promise<void | Response>;
}

export const videoController: VideoController = {
  async create(req: Request, res: Response) {
    try {
      const { onedriveId, ownerId, downloadUrl } = req.body;
      
      // Validate required fields
      if (!onedriveId || !ownerId || !downloadUrl) {
        console.error('Missing required fields:', { onedriveId, ownerId, downloadUrl });
        return res.status(400).json({ 
          error: 'Missing required fields',
          missing: {
            onedriveId: !onedriveId,
            ownerId: !ownerId,
            downloadUrl: !downloadUrl
          }
        });
      }

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
      const expiry = video.url_expiry ? new Date(video.url_expiry) : new Date(0);
      
      // If URL is still valid, return it
      if (now < expiry && video.download_url) {
        return res.json({ url: video.download_url });
      }

      // If we have a token, refresh the URL
      if (token) {
        try {
          const newUrl = await oneDriveService.getVideoDetails(video.onedrive_id, token as string);
          VideoModel.updateUrl(id, newUrl.downloadUrl);
          return res.json({ url: newUrl.downloadUrl });
        } catch (error) {
          console.error('Failed to refresh URL:', error);
          // If we still have an old URL, return it as fallback
          if (video.download_url) {
            return res.json({ url: video.download_url });
          }
          throw error;
        }
      }

      // No valid URL and no token to refresh
      return res.status(401).json({ 
        error: 'Token required for URL refresh',
        needsAuth: true
      });
    } catch (error) {
      console.error('Error getting video URL:', error);
      res.status(500).json({ error: 'Failed to get video URL' });
    }
  },

  async getVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { token } = req.query;
      
      const video = VideoModel.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const now = new Date();
      const expiry = video.url_expiry ? new Date(video.url_expiry) : new Date(0);
      let downloadUrl = video.download_url;

      // If URL is expired and we have a token, refresh it
      if (now >= expiry && token) {
        try {
          const newUrl = await oneDriveService.getVideoDetails(video.onedrive_id, token as string);
          VideoModel.updateUrl(id, newUrl.downloadUrl);
          downloadUrl = newUrl.downloadUrl;
        } catch (error) {
          console.error('Failed to refresh URL:', error);
          // Keep using old URL if refresh fails
        }
      }

      // Return video metadata with URL
      const videoResponse = {
        id: video.id,
        name: video.name || 'Shared Video',
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        ownerId: video.owner_id,
        downloadUrl,
        urlExpiry: video.url_expiry,
        needsAuth: now >= expiry && !token
      };

      res.json(videoResponse);
    } catch (error) {
      console.error('Error getting video:', error);
      res.status(500).json({ error: 'Failed to get video' });
    }
  }
};