import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Share2,
  Maximize2, Minimize2, ExternalLink,
  SkipBack, SkipForward, Trash2,
  VideoIcon
} from 'lucide-react';
import { DeleteConfirmation } from './DeleteConfirmation';
import { oneDriveService } from '../services/oneDrive';
import { toast } from 'react-hot-toast';
import { authService } from '../services/auth';

interface VideoPlayerProps {
  video: {
    id: string;
    url: string;
    name: string;
    createdDateTime: string;
  };
  className?: string;
  onDelete?: () => void;
  isTheaterMode?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatVideoName = (filename: string): string => {
  const nameWithoutPrefix = filename.replace(/^recording_/, '').replace(/\.webm$/, '');
  const parts = nameWithoutPrefix.split('_');

  if (parts.length === 2) {
    const [date, time] = parts;
    const formattedDate = new Date(date).toLocaleDateString();
    const formattedTime = time.replace(/-/g, ':');
    return `Recording from ${formattedDate} at ${formattedTime}`;
  }

  return filename;
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  className = '',
  onDelete,
  isTheaterMode = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!isTheaterMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoUrl, setVideoUrl] = useState(video.url);
  const [isRefreshingUrl, setIsRefreshingUrl] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime -= 10;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast.error('Failed to toggle fullscreen');
    }
  };

  const shareVideo = () => {
    const shareUrl = `${window.location.origin}/video/${video.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Video link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await oneDriveService.deleteVideo(video.id);
      onDelete();
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error('Failed to delete video');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const refreshVideoUrl = async () => {
    try {
      setIsRefreshingUrl(true);
      const token = await authService.getAccessToken();
      const response = await fetch(`${API_URL}/api/videos/${video.id}/url?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to refresh video URL');
      }

      const data = await response.json();
      setVideoUrl(data.url);
    } catch (error) {
      console.error('Failed to refresh video URL:', error);
      toast.error('Failed to refresh video. Please try again.');
    } finally {
      setIsRefreshingUrl(false);
    }
  };

  useEffect(() => {
    if (video.urlExpiry && new Date(video.urlExpiry) <= new Date()) {
      refreshVideoUrl();
    }
  }, [video.id, video.urlExpiry]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          skipForward();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const handleVideoError = async (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      if (videoElement.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        await refreshVideoUrl();
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('error', handleVideoError);
      return () => videoElement.removeEventListener('error', handleVideoError);
    }
  }, [video.id]);

  return (
    <div
      ref={containerRef}
      className={`${className} relative group ${isTheaterMode ? 'bg-black' : ''}`}
    >
      <div className="relative aspect-video bg-gray-800">
        {video.url ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoIcon className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Video Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {/* Top Controls - Make these clickable */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end space-x-2 pointer-events-auto">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors z-50"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-colors z-50"
                disabled={isDeleting}
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Center Play Button - Make this clickable */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-white/90 text-gray-900 hover:bg-white transform transition-all hover:scale-110 z-50"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>

          {/* Bottom Controls - Make these clickable */}
          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={skipBackward}>
                  <SkipBack size={20} />
                </button>
                <button onClick={skipForward}>
                  <SkipForward size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
                <span className="text-sm text-white">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={shareVideo}
                className="text-white hover:text-blue-400"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">
          {formatVideoName(video.name)}
        </h3>
        <p className="text-sm text-gray-400">
          {formatDateTime(video.createdDateTime)}
        </p>
      </div>

      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        videoName={formatVideoName(video.name)}
      />
    </div>
  );
};
