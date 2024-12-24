import { UploadProgressCallback, UploadResponse, VideoMetadata } from './types';
import { authService } from '../auth';
import { videoApi } from '../api/videoApi';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export class UploadService {
  async createUploadSession(fileName: string, headers: Headers): Promise<{ uploadUrl: string }> {
    const response = await fetch(
      `${GRAPH_ENDPOINT}/me/drive/root:/${fileName}:/createUploadSession`,
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
      throw new Error(`Failed to create upload session: ${response.status}`);
    }

    return response.json();
  }

  async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    offset: number,
    totalSize: number
  ): Promise<Response> {
    const range = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;
    
    return fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': chunk.size.toString(),
        'Content-Range': range,
      },
      body: chunk,
    });
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    try {
      const token = await authService.getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const headers = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      const session = await this.createUploadSession(fileName, headers);
      const totalSize = file.size;
      let offset = 0;

      while (offset < totalSize) {
        const chunk = file.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
        const response = await this.uploadChunk(session.uploadUrl, chunk, offset, totalSize);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        offset += chunk.size;
        onProgress?.((offset / totalSize) * 100);

        if (offset === totalSize) {
          const responseData = await response.json();
          const fileId = responseData.id;
          const downloadUrl = await this.getFileUrl(fileId, headers);
          
          const metadata: VideoMetadata = {
            onedriveId: fileId,
            ownerId: 'user123', // Replace with actual user ID
            downloadUrl,
            token,
          };

          const { id: videoId } = await videoApi.createVideo(metadata);
          return { fileUrl: `/api/videos/${videoId}` };
        }
      }

      throw new Error('Upload completed but failed to get file URL');
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  private async getFileUrl(fileId: string, headers: Headers): Promise<string> {
    const response = await fetch(
      `${GRAPH_ENDPOINT}/me/drive/items/${fileId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to get file URL');
    }

    const data = await response.json();
    return data['@microsoft.graph.downloadUrl'];
  }
}