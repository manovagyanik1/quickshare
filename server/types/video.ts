export interface Video {
  id: string;
  name: string;
  onedrive_id: string;
  owner_id: string;
  download_url: string | null;
  url_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export interface OneDriveVideo {
  id: string;
  name: string;
  downloadUrl: string;
  createdDateTime: string;
  size: number;
}

export interface CreateVideoDTO {
  onedriveId: string;
  ownerId: string;
  downloadUrl: string;
}

export interface VideoResponse {
  id: string;
}

export interface UrlResponse {
  url: string;
}