import { UploadService } from './uploadService';
import { UploadProgressCallback, UploadResponse } from './types';

class OneDriveService {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    return this.uploadService.uploadFile(file, fileName, onProgress);
  }
}

export const oneDriveService = new OneDriveService();