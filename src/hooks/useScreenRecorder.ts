import { useState, useCallback, useRef } from 'react';
import { getScreenStream, getAudioStream, combineStreams } from '../utils/mediaStream';
import { createMediaRecorder } from '../utils/recorder';
import { saveRecording } from '../utils/fileSystem';

interface RecordingState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
}

export const useScreenRecorder = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    mediaRecorder: null
  });
  
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const screenStream = await getScreenStream();
      const audioStream = await getAudioStream();
      const combinedStream = combineStreams(screenStream, audioStream);

      chunks.current = []; // Reset chunks
      const mediaRecorder = createMediaRecorder(combinedStream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);

      setState({
        isRecording: true,
        mediaRecorder
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());

      // Create final recording blob and save it
      const recordingBlob = new Blob(chunks.current, { type: 'video/webm' });
      await saveRecording(recordingBlob);
      
      chunks.current = []; // Clear chunks

      setState({
        isRecording: false,
        mediaRecorder: null
      });
    }
  }, [state.mediaRecorder]);

  return {
    isRecording: state.isRecording,
    startRecording,
    stopRecording
  };
};