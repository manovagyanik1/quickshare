export interface VideoConfig {
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

export interface VideoQualityPreset {
  label: string;
  config: VideoConfig;
}