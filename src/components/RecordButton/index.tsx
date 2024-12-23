import React from 'react';
import { Video, StopCircle } from 'lucide-react';
import { RecordingHint } from './RecordingHint';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onClick }) => {
  return (
    <div className="relative">
      {!isRecording && <RecordingHint />}
      <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium transition-all transform hover:scale-105 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        {isRecording ? (
          <>
            <StopCircle size={24} />
            Stop Recording
          </>
        ) : (
          <>
            <Video size={24} />
            Start Recording
          </>
        )}
      </button>
    </div>
  );
};