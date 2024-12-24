import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { RecordButton } from './RecordButton';
import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { VIDEO_PRESETS } from '../utils/videoPresets';

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(VIDEO_PRESETS[1]); // Default to 720p
  const { isRecording, startRecording, stopRecording } = useScreenRecorder();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  const handleRecordClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording(currentPreset);
    }
  };

  const handleGetStarted = async () => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Start Recording
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              You're all set! Click the button below to start recording your screen.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-6">
              <RecordButton 
                isRecording={isRecording}
                onClick={handleRecordClick}
                currentPreset={currentPreset}
                onPresetChange={setCurrentPreset}
                className="transform hover:scale-105 transition-transform"
              />
              <p className="text-gray-400">
                Your recordings will be saved to your OneDrive automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Record Your Screen Instantly
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Share your ideas effortlessly with our lightweight browser-based screen recorder. 
            No downloads required – just connect with OneDrive and start recording.
          </p>
          <div className="space-y-4 mt-8">
            <p className="text-gray-400">
              ✨ Free forever, no hidden costs
            </p>
            <p className="text-gray-400">
              🔒 Your videos stay in your OneDrive - we never store your data
            </p>
            <p className="text-gray-400">
              ☁️ Access your recordings anywhere through OneDrive
            </p>
            <p className="text-gray-400">
              🚀 Start in seconds - no software installation needed
            </p>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleGetStarted}
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Connect with OneDrive
            </button>
            <Link
              to="/about"
              className="text-sm font-semibold leading-6 text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};