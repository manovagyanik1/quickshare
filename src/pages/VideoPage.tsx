import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../services/auth';

interface VideoDetails {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  downloadUrl: string;
  urlExpiry?: string;
  needsAuth?: boolean;
}

const transformVideoDetails = (details: VideoDetails) => {
  return {
    id: details.id,
    url: details.downloadUrl,
    name: details.name,
    createdDateTime: details.createdAt
  };
};

export const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      
      try {
        setIsLoading(true);
        const token = await authService.getAccessToken();
        const response = await fetch(`/api/videos/${videoId}${token ? `?token=${token}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }

        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error('Error fetching video:', error);
        toast.error('Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Video not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-400"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-800">
          <h1 className="text-white font-semibold truncate">{video.name}</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Close"
          >
            <X className="text-gray-400 hover:text-white" size={24} />
          </button>
        </div>

        <div className="flex-1 relative">
          <VideoPlayer
            video={transformVideoDetails(video)}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}; 