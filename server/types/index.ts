export interface OneDriveVideo {
  id: string;
  name: string;
  downloadUrl: string;
  createdDateTime: string;
  size: number;
}

export interface StoredVideo {
  id: string;
  onedriveId: string;
  ownerId: string;
  downloadUrl: string;
  createdAt: string;
} 