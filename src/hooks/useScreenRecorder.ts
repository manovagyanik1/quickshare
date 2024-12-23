import { useState, useCallback, useRef } from 'react';
import { getScreenStream, getAudioStream, combineStreams } from '../utils/mediaStream';
import { createMediaRecorder } from '../utils/recorder';
import { oneDriveService } from '../services/oneDrive';
import { formatFileName } from '../utils/formatFileName';
import { VideoQualityPreset } from '../utils/types';
import { VIDEO_PRESETS } from '../utils/videoPresets';

export const useScreenRecorder = () => {
  const [state, setState] = useState({
    isRecording: false,
    mediaRecorder: null as MediaRecorder | null,
    currentPreset: VIDEO_PRESETS[1] // Default to medium quality
  });

  const uploadSessionRef = useRef<{ uploadUrl: string; fileName: string } | null>(null);
  const chunksUploaded = useRef<number>(0);
  
  const setQualityPreset = useCallback((preset: VideoQualityPreset) => {
    if (!state.isRecording) {
      setState(prev => ({ ...prev, currentPreset: preset }));
    }
  }, [state.isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const screenStream = await getScreenStream();
      const audioStream = await getAudioStream();
      const combinedStream = combineStreams(screenStream, audioStream);

      // Get screen dimensions for bitrate calculation
      const videoTrack = screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const { width = 1920, height = 1080 } = settings;

      // Adjust bitrate based on resolution if needed
      const adjustedPreset = {
        ...state.currentPreset,
        config: {
          ...state.currentPreset.config,
          videoBitsPerSecond: calculateOptimalBitrate(width, height, state.currentPreset)
        }
      };

      // Create upload session before starting recording
      const fileName = formatFileName();
      const session = await oneDriveService.createUploadSession(fileName);
      uploadSessionRef.current = { uploadUrl: session.uploadUrl, fileName };
      chunksUploaded.current = 0;

      const mediaRecorder = createMediaRecorder(combinedStream, adjustedPreset.config);

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && uploadSessionRef.current) {
          const chunk = event.data;
          const start = chunksUploaded.current;
          const end = start + chunk.size - 1;
          
          try {
            await oneDriveService.uploadChunk(
              uploadSessionRef.current.uploadUrl,
              chunk,
              start,
              end,
              calculateTotalSize(width, height, adjustedPreset.config.videoBitsPerSecond)
            );
            chunksUploaded.current += chunk.size;
          } catch (error) {
            console.error('Failed to upload chunk:', error);
          }
        }
      };

      mediaRecorder.start(5000); // Send chunks every 5 seconds

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

      // Final cleanup
      uploadSessionRef.current = null;
      chunksUploaded.current = 0;

      setState(prev => ({
        ...prev,
        isRecording: false,
        mediaRecorder: null
      }));
    }
  }, [state.mediaRecorder]);

  // Helper function to calculate optimal bitrate based on resolution
  const calculateOptimalBitrate = (width: number, height: number, preset: VideoQualityPreset): number => {
    const pixelCount = width * height;
    const basePixelCount = 1920 * 1080; // Full HD reference
    const scaleFactor = Math.min(pixelCount / basePixelCount, 1);
    
    return Math.round(preset.config.videoBitsPerSecond * scaleFactor);
  };

  // Helper function to estimate total size
  const calculateTotalSize = (width: number, height: number, bitsPerSecond: number): number => {
    const estimatedDuration = 3600; // 1 hour in seconds
    return Math.round((bitsPerSecond / 8) * estimatedDuration); // Convert to bytes
  };

  return {
    isRecording: state.isRecording,
    currentPreset: state.currentPreset,
    setQualityPreset,
    startRecording,
    stopRecording,
    availablePresets: VIDEO_PRESETS
  };
};