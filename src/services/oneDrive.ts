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
    console.log('Access Token:', token ? 'Present' : 'Missing'); // Debug log
    if (!token) throw new Error('Not authenticated');

    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async createUploadSession(fileName: string): Promise<UploadSessionResponse> {
    try {
      console.log('Creating upload session for:', fileName); // Debug log
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
        const errorText = await response.text();
        console.error('Upload session creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to create upload session: ${response.status} ${errorText}`);
      }

      const sessionData = await response.json();
      console.log('Upload session created:', sessionData); // Debug log
      return sessionData;
    } catch (error) {
      console.error('Error in createUploadSession:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    try {
      console.log('Starting file upload:', { fileName, size: file.size }); // Debug log
      const session = await this.createUploadSession(fileName);
      const totalSize = file.size;
      let offset = 0;

      while (offset < totalSize) {
        const chunk = file.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
        const range = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;

        console.log('Uploading chunk:', { 
          range, 
          chunkSize: chunk.size,
          progress: `${Math.round((offset / totalSize) * 100)}%`
        }); // Debug log

        const response = await fetch(session.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Length': chunk.size.toString(),
            'Content-Range': range,
          },
          body: chunk,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Chunk upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        offset += chunk.size;
        
        if (onProgress) {
          onProgress((offset / totalSize) * 100);
        }
      }

      console.log('File upload completed successfully'); // Debug log
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }
}

export const oneDriveService = new OneDriveService();