import { VideoMetadata } from '../oneDrive/types';

class VideoApi {
  async createVideo(metadata: VideoMetadata): Promise<{ id: string }> {
    const response = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to store video metadata');
    }

    return response.json();
  }

  async getVideoUrl(videoId: string, token?: string): Promise<{ url: string }> {
    const url = new URL(`/api/videos/${videoId}`, window.location.origin);
    if (token) {
      url.searchParams.set('token', token);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to get video URL');
    }

    return response.json();
  }
}

export const videoApi = new VideoApi();