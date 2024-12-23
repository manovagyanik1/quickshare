import { VideoConfig } from './types';

const DEFAULT_CONFIG: VideoConfig = {
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000,  // 128 kbps
};

export const createMediaRecorder = (stream: MediaStream, config: Partial<VideoConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Try VP8 first (more efficient), fallback to VP9 if not supported
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm;codecs=vp9,opus';

  return new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: finalConfig.videoBitsPerSecond,
    audioBitsPerSecond: finalConfig.audioBitsPerSecond
  });
};