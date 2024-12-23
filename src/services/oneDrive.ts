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

interface Video {
  id: string;
  name: string;
  url: string;
  createdDateTime: string;
  size: number;
}

const FOLDER_NAME = 'quickshare-recordings';

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
      const uploadPath = `${FOLDER_NAME}/${fileName}`;
      console.log('Creating upload session for:', uploadPath); // Debug log
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/root:/${uploadPath}:/createUploadSession`,
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

  private async ensureFolder(): Promise<string> {
    const headers = await this.getHeaders();
    
    // Check if folder exists
    try {
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/root:/${FOLDER_NAME}`,
        { headers }
      );
      
      if (response.ok) {
        const folder = await response.json();
        return folder.id;
      }
    } catch (error) {
      console.error('Error checking folder:', error);
    }

    // Create folder if it doesn't exist
    const response = await fetch(
      `${GRAPH_ENDPOINT}/me/drive/root/children`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: FOLDER_NAME,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'fail'
        })
      }
    );

    const folder = await response.json();
    return folder.id;
  }

  async listVideos(): Promise<Video[]> {
    try {
      console.log('Fetching videos from folder:', FOLDER_NAME);
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/root:/${FOLDER_NAME}:/children?$filter=file ne null&$orderby=createdDateTime desc`,
        { headers }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch videos:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      console.log('Fetched videos:', data.value);
      
      return data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item['@microsoft.graph.downloadUrl'],
        createdDateTime: item.createdDateTime,
        size: item.size
      }));
    } catch (error) {
      console.error('Error in listVideos:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    await this.ensureFolder();
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