import React, { useEffect, useState } from 'react';
import { oneDriveService } from '../services/oneDrive';
import { VideoPlayer } from './VideoPlayer';
import { Video as VideoIcon } from 'lucide-react';
import { useScreenRecorder } from '../hooks/useScreenRecorder';

interface Video {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
  size: number;
  isProcessing?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
}

export const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { uploadingVideo } = useScreenRecorder();

  // Initial fetch of videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle uploading video state
  useEffect(() => {
    if (uploadingVideo) {
      setVideos(prev => {
        const existingIndex = prev.findIndex(v => v.id === uploadingVideo.id);
        const updatedVideo: Video = {
          id: uploadingVideo.id,
          name: 'Recording in progress...',
          url: '',
          createdDateTime: new Date().toISOString(),
          size: 0,
          isUploading: true,
          uploadProgress: uploadingVideo.progress
        };

        if (existingIndex >= 0) {
          // Update existing video
          const newVideos = [...prev];
          newVideos[existingIndex] = updatedVideo;
          return newVideos;
        } else {
          // Add new video at the beginning
          return [updatedVideo, ...prev];
        }
      });
    }
  }, [uploadingVideo]);

  const fetchVideos = async () => {
    try {
      const fetchedVideos = await oneDriveService.listVideos();
      setVideos(prev => {
        // Keep any uploading videos at the top
        const uploadingVideos = prev.filter(v => v.isUploading);
        return [...uploadingVideos, ...fetchedVideos];
      });
      setError(null);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Show initial loading state
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchVideos}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show empty state
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

  // Show video grid
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