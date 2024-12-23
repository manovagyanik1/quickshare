import React from 'react';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { useScreenRecorder } from '../hooks/useScreenRecorder';

export const Home = () => {
  const { isRecording, startRecording, stopRecording } = useScreenRecorder();

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
      <Features />
    </>
  );
};