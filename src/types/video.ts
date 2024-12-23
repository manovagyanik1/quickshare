export interface UploadingVideo {
  id: string;
  progress: number;
}

export interface Video {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
  size: number;
  isUploading?: boolean;
  uploadProgress?: number;
} 