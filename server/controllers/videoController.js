import { VideoModel } from '../models/video.js';
import { oneDriveService } from '../services/oneDriveService.js';

export const videoController = {
  async create(req, res) {
    try {
      const { onedriveId, ownerId, downloadUrl } = req.body;

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

      const id = await VideoModel.create({ onedriveId, ownerId, downloadUrl });
      res.status(201).json({ id });
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ error: 'Failed to create video' });
    }
  },

  async getUrl(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      const video = await VideoModel.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const now = new Date();
      const expiry = video.url_expiry ? new Date(video.url_expiry) : new Date(0);

      if (now < expiry && video.download_url) {
        return res.json({ url: video.download_url });
      }

      if (token) {
        try {
          const newUrl = await oneDriveService.getVideoDetails(video.onedrive_id, token);
          await VideoModel.updateUrl(id, newUrl.downloadUrl);
          return res.json({ url: newUrl.downloadUrl });
        } catch (error) {
          console.error('Failed to refresh URL:', error);
          if (video.download_url) {
            return res.json({ url: video.download_url });
          }
          throw error;
        }
      }

      return res.status(401).json({
        error: 'Token required for URL refresh',
        needsAuth: true
      });
    } catch (error) {
      console.error('Error getting video URL:', error);
      res.status(500).json({ error: 'Failed to get video URL' });
    }
  },

  async getVideo(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      const video = await VideoModel.findById(id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const now = new Date();
      const expiry = video.url_expiry ? new Date(video.url_expiry) : new Date(0);
      let downloadUrl = video.download_url;

      if (now >= expiry && token) {
        try {
          const newUrl = await oneDriveService.getVideoDetails(video.onedrive_id, token);
          VideoModel.updateUrl(id, newUrl.downloadUrl);
          downloadUrl = newUrl.downloadUrl;
        } catch (error) {
          console.error('Failed to refresh URL:', error);
        }
      }

      res.json({
        id: video.id,
        name: video.name || 'Shared Video',
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        ownerId: video.owner_id,
        onedriveId: video.onedrive_id,
        downloadUrl,
        urlExpiry: video.url_expiry,
        needsAuth: now >= expiry && !token
      });
    } catch (error) {
      console.error('Error getting video:', error);
      res.status(500).json({ error: 'Failed to get video' });
    }
  }
};
