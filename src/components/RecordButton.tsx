import React from 'react';
import { Video, StopCircle } from 'lucide-react';
import { QualitySelector } from './QualitySelector';
import { VIDEO_PRESETS } from '../utils/videoPresets';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  currentPreset: typeof VIDEO_PRESETS[0];
  onPresetChange: (preset: typeof VIDEO_PRESETS[0]) => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onClick,
  currentPreset,
  onPresetChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        {isRecording ? (
          <>
            <StopCircle size={20} />
            Stop Recording
          </>
        ) : (
          <>
            <Video size={20} />
            Start Recording
          </>
        )}
      </button>
      <QualitySelector
        currentPreset={currentPreset}
        onPresetChange={onPresetChange}
        disabled={isRecording}
      />
    </div>
  );
};