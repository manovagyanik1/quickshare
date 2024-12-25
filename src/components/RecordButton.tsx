import React from 'react';
import { Video, StopCircle } from 'lucide-react';
import { QualitySelector } from './QualitySelector';
import { VIDEO_PRESETS } from '../utils/videoPresets';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { VideoQualityPreset } from '../utils/types';

interface RecordButtonProps {
  className?: string;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  className = ''
}) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    currentPreset,
    setQualityPreset,
    MobileModal
  } = useScreenRecorder();

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          ${className}
          p-8 rounded-full
          ${isRecording 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'}
          shadow-lg hover:shadow-xl
          transition-all duration-200
          flex items-center justify-center
          group
        `}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-75 transition"></div>
          {isRecording ? (
            <StopCircle className="w-16 h-16 text-white relative" />
          ) : (
            <Video className="w-16 h-16 text-white relative" />
          )}
        </div>
      </button>
      
      <QualitySelector
        currentPreset={currentPreset}
        onPresetChange={setQualityPreset}
        presets={VIDEO_PRESETS}
        disabled={isRecording}
      />
      <MobileModal />
    </div>
  );
};