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

export interface VideoMetadata {
  onedriveId: string;
  ownerId: string;
  downloadUrl: string;
  token: string;
}

interface ShareResponse {
  shareId: string;
  webUrl: string;
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

  /**
   * Extracts the file ID from the sharable OneDrive link.
   * @param {string} sharableLink - The full OneDrive sharable link.
   * @returns {string} - The extracted file ID.
   */
  extractFileId(sharableLink: string): string {
    try {
      // Extract the part after "/u/s!" using a regular expression
      const match = sharableLink.match(/\/u\/s!([^?]+)/);
      if (match && match[1]) {
        return match[1];
      } else {
        throw new Error("Invalid sharable link format.");
      }
    } catch (error) {
      throw new Error("Failed to extract file ID: " + (error as Error).message);
    }
  }

  /**
   * Generates the Microsoft Graph API URL from the file ID.
   * @param {string} fileId - The unique file ID extracted from the sharable link.
   * @returns {string} - The Microsoft Graph API URL.
   */
  generateGraphApiUrl(fileId: string): string {
    // Validate the file ID
    if (!fileId || typeof fileId !== "string") {
      throw new Error("Invalid file ID provided.");
    }

    // Base64 encode the file ID
    const base64Encoded = btoa(`https://1drv.ms/u/s!${fileId}`);

    // Replace special characters in Base64 encoded string for OneDrive compatibility
    const safeBase64 = base64Encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    // Construct the Microsoft Graph API URL
    return `https://graph.microsoft.com/v1.0/shares/u!${safeBase64}/driveItem`;
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
          const {shareId} = await this.makeFilePublic(fileId as string);
          
          // Get the download URL
          const downloadUrl = await this.getFileUrl(fileId as string);
          
          // Before making the request, let's log the user
          const user = await authService.getUser();
          if (!user || !user.id) {
            throw new Error('User not authenticated');
          }

          // Store in our database
          console.log('Uploading to database:', {
            onedriveId: shareId,
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
              shareId,
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

  private async makeFilePublic(fileId: string): Promise<ShareResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(
        `${GRAPH_ENDPOINT}/me/drive/items/${fileId}/createLink`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'embed',
            scope: 'anonymous',
            password: null,
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to make file public:', errorText);
        throw new Error('Failed to make file public');
      }

      const data = await response.json();
      console.log('Share link created:', data);
      
      // Get the sharing URL in the correct format
      const webUrl = data.link.webUrl;
      const shareId = this.extractFileId(webUrl);
      
      return { shareId, webUrl };
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

  async getVideoDetails(shareId: string): Promise<Video> {
    try {
      const headers = await this.getHeaders();
      const graphApiUrl = this.generateGraphApiUrl(shareId);

      const response = await fetch(
        graphApiUrl,
        { headers }
      );

      if (!response.ok) {
        console.error('Graph API Error:', await response.text());
        if (response.status === 404) {
          throw new Error('Video not found or access denied');
        }
        throw new Error('Failed to get video details');
      }

      const data = await response.json();
      console.log('Video details response:', data);
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