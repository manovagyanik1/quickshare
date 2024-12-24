export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResponse {
  fileUrl: string;
}

export interface VideoMetadata {
  onedriveId: string;
  ownerId: string;
  downloadUrl: string;
  token: string;
}