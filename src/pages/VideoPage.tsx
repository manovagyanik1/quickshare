import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { oneDriveService } from '../services/oneDrive';
import { VideoPlayer } from '../components/VideoPlayer';
import { X } from 'lucide-react';
import { useOneDrive } from '../hooks/useOneDrive';
import { Header } from '../components/Header';

interface VideoDetails {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
}

export const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useOneDrive();

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      
      try {
        setIsLoading(true);
        // Check if this is a shared URL
        const params = new URLSearchParams(location.search);
        if (params.get('url')) {
          // Redirect to shared video page
          navigate(`/shared/${videoId}${location.search}`);
          return;
        }

        if (isLoggedIn) {
          const videoDetails = await oneDriveService.getVideoDetails(videoId);
          setVideo(videoDetails);
        } else {
          setVideo({
            id: videoId,
            name: 'Video Unavailable',
            url: '',
            createdDateTime: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to fetch video:', error);
        setVideo({
          id: videoId,
          name: 'Video Unavailable',
          url: '',
          createdDateTime: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, isLoggedIn, location.search, navigate]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      </>
    );
  }

  if (!video) {
    return (
      <>
        <Header />
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Video not found</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300"
            >
              Go back home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
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

        {/* Video Player */}
        <div className="flex-1 relative">
          <VideoPlayer
            video={video}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
}; 