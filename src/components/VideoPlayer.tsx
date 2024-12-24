import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Share2, 
  Maximize2, Minimize2, ExternalLink, 
  SkipBack, SkipForward, Upload, Trash2,
  VideoIcon
} from 'lucide-react';
import { DeleteConfirmation } from './DeleteConfirmation';
import { oneDriveService } from '../services/oneDrive';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface VideoPlayerProps {
  video: {
    id: string;
    url: string;
    name: string;
    createdDateTime: string;
    uploadProgress?: number;
    isUploading?: boolean;
  };
  className?: string;
  onDelete?: () => void;
  isTheaterMode?: boolean;
}

const formatVideoName = (filename: string): string => {
  // Remove the 'recording_' prefix and '.webm' extension
  const nameWithoutPrefix = filename.replace(/^recording_/, '').replace(/\.webm$/, '');
  
  // Replace underscores and hyphens with spaces
  const parts = nameWithoutPrefix.split('_');
  
  if (parts.length === 2) {
    const [date, time] = parts;
    const formattedDate = new Date(date).toLocaleDateString();
    const formattedTime = time.replace(/-/g, ':');
    return `Recording from ${formattedDate} at ${formattedTime}`;
  }
  
  return filename; // Fallback to original filename if format doesn't match
};

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
  const [showControls, setShowControls] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    } else {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareVideo = () => {
    // Include the download URL in the shared URL as a query parameter
    const encodedVideoUrl = encodeURIComponent(video.url);
    const shareUrl = `${window.location.origin}/video/${video.id}?url=${encodedVideoUrl}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Video link copied to clipboard!');
  };

  const openInOneDrive = () => {
    const oneDriveUrl = `https://onedrive.live.com/?id=${video.id}`;
    window.open(oneDriveUrl, '_blank');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await oneDriveService.deleteVideo(video.id);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete video:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Add keyboard controls
  React.useEffect(() => {
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

  const renderPlayButton = () => {
    if (video.isUploading) {
      return (
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            {video.uploadProgress !== undefined && (
              <div className="absolute -bottom-6 text-sm text-white font-medium">
                {Math.round(video.uploadProgress)}%
              </div>
            )}
          </div>
          <div className="mt-8 text-sm text-gray-300">
            Uploading your recording...
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={togglePlay}
        className="p-4 rounded-full bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100 transform transition-transform hover:scale-110"
      >
        {isPlaying ? <Pause size={32} /> : <Play size={32} />}
      </button>
    );
  };

  const renderUploadingState = () => {
    if (!video.isUploading) return null;

    const progress = video.uploadProgress || 0;
    const progressText = `${Math.round(progress)}%`;

    return (
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center max-w-xs w-full px-6">
          {/* Animated Upload Icon */}
          <div className="relative mb-6">
            <Upload 
              className={`h-12 w-12 text-blue-400 animate-bounce ${
                progress === 100 ? 'text-green-400' : ''
              }`}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-300">
              {progressText}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              {progress === 100 ? 'Processing...' : 'Uploading Recording...'}
            </h4>
            <p className="text-sm text-gray-400">
              {progress === 100 
                ? 'Almost there! Finalizing your recording...'
                : 'Please wait while we save your recording...'}
            </p>
          </div>

          {/* Upload Stats */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>{new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>{formatVideoName(video.name)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`${className} relative group ${isTheaterMode ? 'bg-black' : ''}`}
    >
      <div className="relative aspect-video bg-gray-800">
        {video.url ? (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 text-gray-600">
              <VideoIcon />
            </div>
          </div>
        )}

        {/* Video Controls or Upload State */}
        {video.isUploading ? (
          renderUploadingState()
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end space-x-2 z-10">
              <button
                onClick={openInOneDrive}
                className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors"
                title="Open in OneDrive"
              >
                <ExternalLink size={20} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white transition-colors ${
                  isDeleting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={isDeleting}
                title="Delete Recording"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100 transform transition-transform hover:scale-110"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 mb-4 rounded-lg appearance-none cursor-pointer bg-gray-400"
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
                      className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-gray-400"
                    />
                  </div>
                  <span className="text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={shareVideo}
                    className="text-white hover:text-blue-400"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {video.isUploading ? 'New Recording' : formatVideoName(video.name)}
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          {new Date(video.createdDateTime).toLocaleString()}
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