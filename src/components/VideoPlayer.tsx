import React, { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Share2, 
  Maximize2, Minimize2, ExternalLink, 
  SkipBack, SkipForward
} from 'lucide-react';

interface VideoPlayerProps {
  video: {
    url: string;
    name: string;
    createdDateTime: string;
    id: string; // needed for OneDrive link
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

  if (isLoading) {
    return (
      <div className={`${className} aspect-video flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        className={`relative group aspect-video ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
        onMouseEnter={() => {
          setShowControls(true);
          setShowFullscreenControls(true);
        }}
        onMouseMove={() => {
          setShowControls(true);
          setShowFullscreenControls(true);
        }}
        onMouseLeave={() => {
          if (!isFullscreen) {
            setShowControls(false);
          }
        }}
      >
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
        
        {/* Video Controls Overlay */}
        <div 
          className={`absolute inset-0 ${
            isFullscreen 
              ? showFullscreenControls ? 'opacity-100' : 'opacity-0' 
              : showControls ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        >
          {/* Semi-transparent background overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none" />

          {/* Top Bar */}
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
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white mb-1">
            {formatVideoName(video.name)}
          </h3>
          <button
            onClick={openInOneDrive}
            className="text-gray-400 hover:text-blue-400"
            title="Open in OneDrive"
          >
            <ExternalLink size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-400">
          {new Date(video.createdDateTime).toLocaleString()}
        </p>
      </div>
    </div>
  );
}; 