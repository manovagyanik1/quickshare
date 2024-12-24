import React, { useEffect, useState, useCallback } from 'react';
import { oneDriveService } from '../services/oneDrive';
import { Video as VideoIcon } from 'lucide-react';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { useOneDrive } from '../hooks/useOneDrive';
import { VideoPlayer } from './VideoPlayer';
import { formatFileName } from '../utils/formatFileName';

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
  const { uploadingVideo, newVideoUrl } = useScreenRecorder();
  const { isLoggedIn } = useOneDrive();

  const fetchVideos = useCallback(async () => {
    if (!isLoggedIn) {
      setVideos([]);
      setIsInitialLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedVideos = await oneDriveService.listVideos();
      setVideos(prev => {
        // Keep any uploading videos at the top
        const uploadingVideos = prev.filter(v => v.isUploading);
        return [...uploadingVideos, ...fetchedVideos];
      });
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsInitialLoading(false);
    }
  }, [isLoggedIn]);

  // Initial fetch and auth state change handler
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, isLoggedIn]);

  // Handle uploading video state
  useEffect(() => {
    if (uploadingVideo) {
      setVideos(prev => {
        const existingIndex = prev.findIndex(v => v.id === uploadingVideo.id);
        const updatedVideo: Video = {
          id: uploadingVideo.id,
          name: formatFileName(),
          url: '',
          createdDateTime: new Date().toISOString(),
          size: 0,
          isUploading: true,
          uploadProgress: uploadingVideo.progress
        };

        if (existingIndex >= 0) {
          return prev.map(v => v.id === uploadingVideo.id ? updatedVideo : v);
        }
        return [updatedVideo, ...prev];
      });
    }
  }, [uploadingVideo]);

  // Handle new video URL
  useEffect(() => {
    if (newVideoUrl) {
      fetchVideos();
    }
  }, [newVideoUrl, fetchVideos]);

  const handleVideoDelete = useCallback(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (isInitialLoading) {
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
        <button 
          onClick={fetchVideos}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
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
          onDelete={handleVideoDelete}
        />
      ))}
    </div>
  );
}; 