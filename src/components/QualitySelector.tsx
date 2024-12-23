import React, { useState, useRef } from 'react';
import { Settings } from 'lucide-react';
import { VIDEO_PRESETS } from '../utils/videoPresets';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

interface QualitySelectorProps {
  currentPreset: typeof VIDEO_PRESETS[0];
  onPresetChange: (preset: typeof VIDEO_PRESETS[0]) => void;
  disabled?: boolean;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  currentPreset,
  onPresetChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`p-2 rounded-full ${
          disabled 
            ? 'bg-gray-700 text-gray-500' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
        title="Recording Quality"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 min-w-[200px]">
          <div className="text-sm font-medium text-gray-400 px-3 py-2">
            Recording Quality
          </div>
          {VIDEO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onPresetChange(preset);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
                currentPreset.label === preset.label
                  ? 'bg-gray-700 text-blue-400'
                  : 'text-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 