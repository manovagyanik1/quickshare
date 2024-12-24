import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { X } from 'lucide-react';
import { Header } from '../components/Header';

export const SharedVideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sharedUrl = params.get('url');

  if (!sharedUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Invalid video URL</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const video = {
    id: videoId!,
    name: 'Shared Video',
    url: decodeURIComponent(sharedUrl),
    createdDateTime: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* <Header /> */}
      
      {/* Theater mode container */}
      <div className="max-w-[90%] mx-auto pt-6">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            video={video}
            className="w-full h-full"
            isTheaterMode
          />
        </div>

        {/* Video info section */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Shared Video
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Close"
            >
              <X className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 