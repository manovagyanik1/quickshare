import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Share2, 
  Maximize2, Minimize2, ExternalLink, 
  SkipBack, SkipForward
} from 'lucide-react';

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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareVideo = () => {
    navigator.clipboard.writeText(video.url);
    // You could add a toast notification here
  };

  const openInOneDrive = () => {
    const oneDriveUrl = `https://onedrive.live.com/?id=${video.id}`;
    window.open(oneDriveUrl, '_blank');
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

  return (
    <div className={className}>
      <div className="relative group aspect-video">
        {video.url ? (
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full object-cover"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <VideoIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          {renderPlayButton()}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          {video.name}
        </h3>
        <p className="text-sm text-gray-400">
          {new Date(video.createdDateTime).toLocaleString()}
        </p>
      </div>
    </div>
  );
}; 