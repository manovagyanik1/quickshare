import { OneDriveVideo } from '../types';

export class OneDriveService {
  private async getHeaders(token: string): Promise<Headers> {
    return new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  async getVideoDetails(fileId: string, token: string): Promise<OneDriveVideo> {
    const headers = await this.getHeaders(token);
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to get video details');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      downloadUrl: data['@microsoft.graph.downloadUrl'],
      createdDateTime: data.createdDateTime,
      size: data.size
    };
  }
}

export const oneDriveService = new OneDriveService();