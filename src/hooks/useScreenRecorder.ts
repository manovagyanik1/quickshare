import { useState, useCallback, useRef } from 'react';
import { getScreenStream, getAudioStream, combineStreams } from '../utils/mediaStream';
import { createMediaRecorder } from '../utils/recorder';
import { oneDriveService } from '../services/oneDrive';
import { formatFileName } from '../utils/formatFileName';
import { VideoQualityPreset } from '../utils/types';
import { VIDEO_PRESETS } from '../utils/videoPresets';

interface UploadSession {
  uploadUrl: string;
  fileName: string;
  totalSize: number;
}

interface RecordingConfig {
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  width: number;
  height: number;
}

export const useScreenRecorder = () => {
  const [state, setState] = useState({
    isRecording: false,
    mediaRecorder: null as MediaRecorder | null,
    currentPreset: VIDEO_PRESETS[1] // Default to medium quality
  });

  const uploadSessionRef = useRef<UploadSession | null>(null);
  const chunksUploaded = useRef<number>(0);
  const recordingConfigRef = useRef<RecordingConfig | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newVideoUrl, setNewVideoUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<{
    id: string;
    progress: number;
  } | null>(null);

  const setQualityPreset = useCallback((preset: VideoQualityPreset) => {
    if (!state.isRecording) {
      setState(prev => ({ ...prev, currentPreset: preset }));
    }
  }, [state.isRecording]);

  // Calculate optimal bitrate based on screen resolution and preset
  const calculateOptimalBitrate = useCallback((width: number, height: number, preset: VideoQualityPreset): RecordingConfig => {
    const pixelCount = width * height;
    const basePixelCount = 1920 * 1080; // Full HD reference
    const scaleFactor = Math.min(pixelCount / basePixelCount, 1);
    
    // Adjust video bitrate based on resolution
    const videoBitsPerSecond = Math.round(preset.config.videoBitsPerSecond * scaleFactor);
    
    return {
      videoBitsPerSecond,
      audioBitsPerSecond: preset.config.audioBitsPerSecond,
      width,
      height
    };
  }, []);

  // Estimate total file size based on bitrate and duration
  const calculateTotalSize = useCallback((config: RecordingConfig): number => {
    const estimatedDuration = 3600; // 1 hour max duration
    const videoBytesPerSecond = config.videoBitsPerSecond / 8;
    const audioBytesPerSecond = config.audioBitsPerSecond / 8;
    const totalBytesPerSecond = videoBytesPerSecond + audioBytesPerSecond;
    
    return Math.round(totalBytesPerSecond * estimatedDuration);
  }, []);

  // Add event emitter for new videos
  const onNewVideo = useCallback((videoUrl: string) => {
    setNewVideoUrl(videoUrl);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const screenStream = await getScreenStream();
      const audioStream = await getAudioStream();
      const combinedStream = combineStreams(screenStream, audioStream);

      // Get screen dimensions and calculate optimal recording config
      const videoTrack = screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const { width = 1920, height = 1080 } = settings;

      // Calculate optimal recording configuration
      const recordingConfig = calculateOptimalBitrate(width, height, state.currentPreset);
      recordingConfigRef.current = recordingConfig;

      const mediaRecorder = createMediaRecorder(combinedStream, {
        videoBitsPerSecond: recordingConfig.videoBitsPerSecond,
        audioBitsPerSecond: recordingConfig.audioBitsPerSecond
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.start(1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        mediaRecorder
      }));

      // Store chunks for later upload
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const tempId = 'temp-' + Date.now();
        setUploadingVideo({ id: tempId, progress: 0 });

        try {
          const fileName = formatFileName();
          const session = await oneDriveService.createUploadSession(fileName);
          const result = await oneDriveService.uploadFile(
            blob,
            fileName,
            (progress) => {
              setUploadingVideo(prev => prev ? { ...prev, progress } : null);
            }
          );
          if (result?.fileUrl) {
            onNewVideo(tempId, result.fileUrl);
          }
        } catch (error) {
          console.error('Failed to upload video:', error);
        } finally {
          setUploadingVideo(null);
        }
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [state.currentPreset, calculateOptimalBitrate]);

  const stopRecording = useCallback(async () => {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      // Stop the media recorder first to trigger final ondataavailable event
      state.mediaRecorder.stop();
      
      // Wait a bit for the final chunk to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stop all tracks
      state.mediaRecorder.stream.getTracks().forEach(track => track.stop());

      // Final cleanup
      uploadSessionRef.current = null;
      chunksUploaded.current = 0;
      recordingConfigRef.current = null;
      setUploadProgress(0);

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
    uploadProgress,
    newVideoUrl,
    setQualityPreset,
    startRecording,
    stopRecording,
    availablePresets: VIDEO_PRESETS
  };
};