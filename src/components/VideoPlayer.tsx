import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Share2 } from 'lucide-react';

interface VideoPlayerProps {
  video: {
    url: string;
    name: string;
    createdDateTime: string;
  };
  className?: string;
  isLoading?: boolean;
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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, className = '', isLoading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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

  const shareVideo = () => {
    navigator.clipboard.writeText(video.url);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className={`${className} aspect-video flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative group aspect-video">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-cover"
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
          <div className="hidden group-hover:flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-white text-gray-900 hover:bg-gray-200"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-white text-gray-900 hover:bg-gray-200"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={shareVideo}
              className="p-2 rounded-full bg-white text-gray-900 hover:bg-gray-200"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          {formatVideoName(video.name)}
        </h3>
        <p className="text-sm text-gray-400">
          {new Date(video.createdDateTime).toLocaleString()}
        </p>
      </div>
    </div>
  );
}; 