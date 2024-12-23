import { authService } from './auth';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

interface UploadSessionResponse {
  uploadUrl: string;
  expirationDateTime: string;
}

interface UploadProgressCallback {
  (progress: number): void;
}

export class OneDriveService {
  private async getHeaders(): Promise<Headers> {
    const token = await authService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async createUploadSession(fileName: string): Promise<UploadSessionResponse> {
    const headers = await this.getHeaders();
    const response = await fetch(
      `${GRAPH_ENDPOINT}/me/drive/root:/Videos/${fileName}:/createUploadSession`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          item: {
            '@microsoft.graph.conflictBehavior': 'rename',
            name: fileName,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create upload session: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    const session = await this.createUploadSession(fileName);
    const totalSize = file.size;
    let offset = 0;

    while (offset < totalSize) {
      const chunk = file.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
      const range = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;

      const response = await fetch(session.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.size.toString(),
          'Content-Range': range,
        },
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      offset += chunk.size;
      
      if (onProgress) {
        onProgress((offset / totalSize) * 100);
      }
    }
  }
}

export const oneDriveService = new OneDriveService();