import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../services/auth';
import { oneDriveService } from '../services/oneDrive';
import { getApiUrl } from '../services/api';
import { API_CONFIG } from '../services/api';
import { ERROR_MESSAGES } from '../constants';

interface VideoDetails {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  downloadUrl: string;
  onedriveId: string;
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

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;
    
    try {
      setIsLoading(true);
      
      const isLoggedIn = await authService.isAuthenticated();
      let videoData;
      
      if (isLoggedIn) {
        try {
          const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VIDEO_DETAILS(videoId)));
          if (!response.ok) throw new Error('Failed to fetch video');
          const metadata = await response.json();
          
          const videoDetails = await oneDriveService.getVideoDetails(metadata.shareId);
          videoData = {
            id: videoId,
            name: videoDetails.name,
            createdAt: videoDetails.createdDateTime,
            updatedAt: new Date().toISOString(),
            downloadUrl: videoDetails.url,
            onedriveId: videoDetails.id,
            size: videoDetails.size,
            ownerId: metadata.ownerId
          };
        } catch (error) {
          console.error('Failed to get video from OneDrive:', error);
          const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VIDEO_DETAILS(videoId)));
          if (!response.ok) throw new Error('Failed to fetch video');
          videoData = await response.json();
        }
      } else {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VIDEO_DETAILS(videoId)));
        if (!response.ok) throw new Error('Failed to fetch video');
        videoData = await response.json();
        
        if (videoData.needsAuth) {
          toast.error(ERROR_MESSAGES.URL_EXPIRED);
        }
      }

      setVideo(videoData);
    } catch (error) {
      console.error('Error fetching video:', error);
      toast.error(ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

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
              {video.needsAuth ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-800">
                  <p className="text-gray-300 mb-4">{ERROR_MESSAGES.URL_EXPIRED}</p>
                  <button
                    onClick={() => authService.login()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Connect with OneDrive
                  </button>
                </div>
              ) : (
                <VideoPlayer
                  video={transformVideoDetails(video)}
                  className="absolute inset-0"
                  isTheaterMode={true}
                />
              )}
            </div>

            {/* Video Info */}
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {video.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {formatDateTime(video.createdAt)}
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
                  {formatDateTime(video.createdAt)}
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