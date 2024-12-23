import { useState, useCallback, useRef } from 'react';
import { getScreenStream, getAudioStream, combineStreams } from '../utils/mediaStream';
import { createMediaRecorder } from '../utils/recorder';
import { saveRecording } from '../utils/fileSystem';
import { VideoQualityPreset } from '../utils/types';
import { VIDEO_PRESETS } from '../utils/videoPresets';

export const useScreenRecorder = () => {
  const [state, setState] = useState({
    isRecording: false,
    mediaRecorder: null as MediaRecorder | null,
    currentPreset: VIDEO_PRESETS[1] // Default to medium quality
  });
  
  const chunks = useRef<Blob[]>([]);

  const setQualityPreset = (preset: VideoQualityPreset) => {
    setState(prev => ({ ...prev, currentPreset: preset }));
  };

  const startRecording = useCallback(async () => {
    try {
      const screenStream = await getScreenStream();
      const audioStream = await getAudioStream();
      const combinedStream = combineStreams(screenStream, audioStream);

      chunks.current = [];
      const mediaRecorder = createMediaRecorder(combinedStream, state.currentPreset.config);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        mediaRecorder
      }));
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [state.currentPreset]);

  const stopRecording = useCallback(async () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());

      const recordingBlob = new Blob(chunks.current, { type: 'video/webm' });
      await saveRecording(recordingBlob);
      
      chunks.current = [];

      setState(prev => ({
        ...prev,
        isRecording: false,
        mediaRecorder: null
      }));
    }
  }, [state.mediaRecorder]);

  return {
    isRecording: state.isRecording,
    currentPreset: state.currentPreset,
    setQualityPreset,
    startRecording,
    stopRecording,
    availablePresets: VIDEO_PRESETS
  };
};