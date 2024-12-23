import { VideoQualityPreset } from './types';

export const VIDEO_PRESETS: VideoQualityPreset[] = [
  {
    label: 'Low (480p)',
    config: {
      videoBitsPerSecond: 800000,   // 0.8 Mbps
      audioBitsPerSecond: 64000,    // 64 kbps
    }
  },
  {
    label: 'Medium (720p)',
    config: {
      videoBitsPerSecond: 1500000,  // 1.5 Mbps
      audioBitsPerSecond: 128000,   // 128 kbps
    }
  },
  {
    label: 'High (1080p)',
    config: {
      videoBitsPerSecond: 2500000,  // 2.5 Mbps
      audioBitsPerSecond: 128000,   // 128 kbps
    }
  }
];