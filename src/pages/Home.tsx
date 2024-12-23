import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { VideoList } from '../components/VideoList';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { useOneDrive } from '../hooks/useOneDrive';

export const Home = () => {
  const { isRecording, startRecording, stopRecording } = useScreenRecorder();
  const { isLoggedIn } = useOneDrive();

  const handleRecordClick = async () => {
    try {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (error) {
      console.error('Error handling recording:', error);
    }
  };

  return (
    <>
      <Hero isRecording={isRecording} onRecordClick={handleRecordClick} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoggedIn ? (
          <div className="py-12">
            <h2 className="text-2xl font-bold text-white mb-8">Your Recordings</h2>
            <VideoList />
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-400">
              Sign in with OneDrive to see your recordings
            </p>
          </div>
        )}
      </div>
      <Features />
    </>
  );
};