import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { RecordButton } from './RecordButton';
import { VideoList } from './VideoList';
import { Hero } from './Hero';

export const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {isAuthenticated ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex flex-col items-center justify-center py-12">
            <RecordButton 
              isRecording={isRecording}
              onClick={() => setIsRecording(!isRecording)}
              className="transform hover:scale-105 transition-transform"
            />
            <p className="mt-4 text-gray-400">
              Click to start recording your screen
            </p>
          </div>
          <VideoList />
        </div>
      ) : (
        <Hero />
      )}
    </div>
  );
}; 