import React from 'react';
import { RecordButton } from './components/RecordButton';
import { useScreenRecorder } from './hooks/useScreenRecorder';
import { RecordingStatus } from './components/RecordingStatus';

export function App() {
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Screen Recorder</h1>
          <p className="text-gray-600">
            Click the button below to start recording your screen
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <RecordButton
            isRecording={isRecording}
            onClick={handleRecordClick}
          />
        </div>

        <RecordingStatus isRecording={isRecording} />
      </div>
    </div>
  );
}

export default App;