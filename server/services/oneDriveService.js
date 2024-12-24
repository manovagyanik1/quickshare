export async function refreshDownloadUrl(onedriveId, token) {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/items/${onedriveId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to refresh download URL');
  }
  
  const data = await response.json();
  return data['@microsoft.graph.downloadUrl'];
}