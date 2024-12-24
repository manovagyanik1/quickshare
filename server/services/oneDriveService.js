export const oneDriveService = {
  async getVideoDetails(fileId, token) {
    const headers = new Headers({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

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
}; 