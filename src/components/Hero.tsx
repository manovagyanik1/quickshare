import React from 'react';
import { RecordButton } from './RecordButton';
import { RecordingStatus } from './RecordingStatus';
import { OneDriveButton } from './OneDriveButton';
import { useOneDrive } from '../hooks/useOneDrive';
import { VIDEO_PRESETS } from '../utils/videoPresets';
import { useScreenRecorder } from '../hooks/useScreenRecorder';

interface HeroProps {
  isRecording: boolean;
  onRecordClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ isRecording, onRecordClick }) => {
  const { isLoggedIn } = useOneDrive();
  const { currentPreset, setQualityPreset } = useScreenRecorder();
  const [showRecording, setShowRecording] = React.useState(isLoggedIn);

  // Update showRecording when isLoggedIn changes
  React.useEffect(() => {
    setShowRecording(isLoggedIn);
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setShowRecording(true);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Record Your Screen
            <span className="text-blue-400"> Instantly</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Share your ideas effortlessly with our lightweight browser-based screen recorder. 
            No downloads required – just connect and start recording.
          </p>
          
          <div className="flex flex-col items-center space-y-6">
            <div className="p-8 bg-gray-800/50 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
              <div className="flex flex-col items-center gap-4">
                {showRecording ? (
                  <>
                    <RecordButton 
                      isRecording={isRecording} 
                      onClick={onRecordClick}
                      currentPreset={currentPreset}
                      onPresetChange={setQualityPreset}
                    />
                    <RecordingStatus isRecording={isRecording} />
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">
                      Connect with OneDrive to start recording
                    </p>
                    <OneDriveButton onLoginSuccess={handleLoginSuccess} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div className="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">100%</div>
              <div className="text-gray-300">Browser-Based</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">HD</div>
              <div className="text-gray-300">Quality</div>
            </div>
            <div className="p-6 bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">Secure</div>
              <div className="text-gray-300">Recording</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};