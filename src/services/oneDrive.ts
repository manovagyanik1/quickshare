import { msalInstance } from '../config/msal';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

const getAccessToken = async () => {
  const account = msalInstance.getAllAccounts()[0];
  const request = {
    scopes: ['Files.ReadWrite', 'Files.ReadWrite.All'],
    account
  };
  
  const response = await msalInstance.acquireTokenSilent(request);
  return response.accessToken;
};

export const uploadToOneDrive = async (file: Blob, fileName: string) => {
  try {
    const token = await getAccessToken();
    
    // 1. Create upload session
    const sessionResponse = await fetch(
      `${GRAPH_ENDPOINT}/me/drive/root:/${fileName}:/createUploadSession`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { uploadUrl } = await sessionResponse.json();

    // 2. Upload file in chunks
    const totalSize = file.size;
    let offset = 0;

    while (offset < totalSize) {
      const chunk = file.slice(offset, offset + UPLOAD_CHUNK_SIZE);
      const range = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunk.size.toString(),
          'Content-Range': range,
        },
        body: chunk,
      });

      offset += chunk.size;
    }

    return true;
  } catch (error) {
    console.error('Error uploading to OneDrive:', error);
    throw error;
  }
};