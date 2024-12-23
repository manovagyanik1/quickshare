import React from 'react';

interface RecordingStatusProps {
  isRecording: boolean;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({ isRecording }) => {
  if (!isRecording) return null;

  return (
    <div className="text-center text-sm text-red-500 animate-pulse">
      Recording in progress...
    </div>
  );
};