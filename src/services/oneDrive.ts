import { authService } from './auth';
import { toast } from 'react-hot-toast';
import { getApiUrl } from './api';
import { API_CONFIG } from './api';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const FOLDER_NAME = 'quickshare-recordings';

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
    try {
      const uploadPath = `${FOLDER_NAME}/${fileName}`;
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
        throw new Error(`Failed to create upload session: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in createUploadSession:', error);
      throw error;
    }
  }

  private async handleGraphError(error: any) {
    if (error.status === 401 || error.status === 403) {
      toast.error('Please reconnect to OneDrive');
      await authService.login();
      return;
    }

    if (error.status === 404) {
      toast.error('Video not found in OneDrive');
      return;
    }

    toast.error('OneDrive error. Please try again.');
  }

  async uploadFile(
    file: Blob,
    fileName: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    await this.ensureFolder();
    try {
      const session = await this.createUploadSession(fileName);
      const totalSize = file.size;
      let offset = 0;
      let fileId: string | null = null;

      while (offset < totalSize) {
        const chunk = file.slice(offset, Math.min(offset + CHUNK_SIZE, totalSize));
        const range = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;

        const uploadResponse = await fetch(session.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Length': chunk.size.toString(),
            'Content-Range': range,
          },
          body: chunk,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        offset += chunk.size;
        onProgress?.((offset / totalSize) * 100);

        // Check if this was the last chunk
        if (offset === totalSize) {
          const responseData = await uploadResponse.json();
          fileId = responseData.id;
          
          // Make the file public
          await this.makeFilePublic(fileId);
          
          // Get the download URL
          const downloadUrl = await this.getFileUrl(fileId);
          
          // Before making the request, let's log the user
          const user = await authService.getUser();
          if (!user || !user.id) {
            throw new Error('User not authenticated');
          }

          // Store in our database
          console.log('Uploading to database:', {
            onedriveId: fileId,
            ownerId: user.id,
            downloadUrl
          });

          const dbResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.VIDEOS), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await authService.getAccessToken()}`
            },
            body: JSON.stringify({
              onedriveId: fileId,
              ownerId: user.id,
              downloadUrl
            })
          });

          console.log('Database response:', await dbResponse.clone().text());

          if (!dbResponse.ok) {
            const errorText = await dbResponse.text();
            console.error('Server response:', errorText);
            throw new Error('Failed to store video metadata');
          }

          const { id: dbId } = await dbResponse.json();
          console.log('Saved video with ID:', dbId);
          return dbId;
        }
      }

      throw new Error('Upload completed but failed to get file URL');
    } catch (error: any) {
      console.error('Error in uploadFile:', error);
      await this.handleGraphError(error);
      throw error;
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/createLink`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'view',
            scope: 'anonymous'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to make file public');
      }
    } catch (error) {
      console.error('Error making file public:', error);
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
      // First ensure folder exists
      await this.ensureFolder();

      // Then list videos
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/root:/${FOLDER_NAME}:/children?$filter=file ne null&$orderby=createdDateTime desc`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      return data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item['@microsoft.graph.downloadUrl'],
        createdDateTime: item.createdDateTime,
        size: item.size
      }));
    } catch (error) {
      console.error('Error listing videos:', error);
      throw error;
    }
  }

  async getVideoDetails(fileId: string): Promise<Video> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/items/${fileId}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to get video details');
      }

      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        url: data['@microsoft.graph.downloadUrl'],
        createdDateTime: data.createdDateTime,
        size: data.size
      };
    } catch (error) {
      console.error('Error getting video details:', error);
      throw error;
    }
  }

  private async getFileUrl(fileId: string): Promise<string> {
    const headers = await this.getHeaders();
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

  async deleteVideo(fileId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/items/${fileId}`,
        {
          method: 'DELETE',
          headers
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete video: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
}

export const oneDriveService = new OneDriveService();