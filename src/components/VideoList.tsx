import React, { useEffect, useState } from 'react';
import { oneDriveService } from '../services/oneDrive';
import { VideoPlayer } from './VideoPlayer';
import { Video as VideoIcon } from 'lucide-react';

interface Video {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
  size: number;
}

export const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos...');
        setIsLoading(true);
        setError(null);
        const fetchedVideos = await oneDriveService.listVideos();
        console.log('Fetched videos:', fetchedVideos);
        setVideos(fetchedVideos);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <VideoIcon className="h-16 w-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No recordings yet
        </h3>
        <p className="text-gray-400 text-center max-w-md">
          Your recorded videos will appear here. Click the record button above to create your first recording.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoPlayer
          key={video.id}
          video={video}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        />
      ))}
    </div>
  );
}; 