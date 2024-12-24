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
  description?: string;
}

const transformVideoDetails = (details: VideoDetails) => {
  return {
    id: details.id,
    url: details.downloadUrl,
    name: details.name,
    createdDateTime: details.createdAt
  };
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
        const response = await fetch(`${API_URL}/api/videos/${videoId}${token ? `?token=${token}` : ''}`);
        
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
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center h-screen">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Section - 75% width on large screens */}
          <div className="lg:w-[75%]">
            {/* Video Player Container */}
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <VideoPlayer
                video={transformVideoDetails(video)}
                className="absolute inset-0"
                isTheaterMode={true}
              />
            </div>

            {/* Video Info */}
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {video.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {new Date(video.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="text-gray-400 hover:text-white" size={20} />
                </button>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-2">
                  Description
                </h2>
                <p className="text-gray-300">
                  {video.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - 25% width on large screens */}
          <div className="lg:w-[25%]">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">
                About this video
              </h2>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <span className="text-gray-400">Uploaded:</span>{' '}
                  {new Date(video.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="text-gray-400">Owner:</span>{' '}
                  {video.ownerId}
                </p>
                {!authService.isAuthenticated() && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">
                      Connect with OneDrive to access more features
                    </p>
                    <button
                      onClick={() => authService.login()}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 