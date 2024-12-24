import React, { useEffect, useState } from 'react';
import { oneDriveService } from '../services/oneDrive';
import { VideoPlayer } from './VideoPlayer';
import { Loader2 } from 'lucide-react';

interface Video {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
}

export const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const videoList = await oneDriveService.listVideos();
        setVideos(videoList);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDelete = (videoId: string) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No videos found. Start recording to create one!
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {videos.map(video => (
        <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
          <VideoPlayer
            video={{
              id: video.id,
              url: video.url,
              name: video.name,
              createdDateTime: video.createdDateTime
            }}
            onDelete={() => handleDelete(video.id)}
          />
        </div>
      ))}
    </div>
  );
}; 