// Update the uploadFile method in OneDriveService class
async uploadFile(
  file: Blob,
  fileName: string,
  onProgress?: UploadProgressCallback
): Promise<{ fileUrl: string }> {
  await this.ensureFolder();
  try {
    console.log('Starting file upload:', { fileName, size: file.size });
    const session = await this.createUploadSession(fileName);
    const totalSize = file.size;
    let offset = 0;
    let fileId: string | null = null;

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
        throw new Error(`Upload failed: ${response.status}`);
      }

      offset += chunk.size;
      const progress = (offset / totalSize) * 100;
      onProgress?.(progress);

      // Check if this was the last chunk
      if (offset === totalSize) {
        const responseData = await response.json();
        fileId = responseData.id;
        // Make the file public after successful upload
        await this.makeFilePublic(fileId);
        
        // Get the download URL
        const downloadUrl = await this.getFileUrl(fileId);
        
        // Store in SQLite database
        const token = await authService.getAccessToken();
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            onedriveId: fileId,
            ownerId: 'user123', // Replace with actual user ID
            downloadUrl,
            token,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to store video metadata');
        }
        
        const { id: videoId } = await response.json();
        return { fileUrl: `/api/videos/${videoId}` };
      }
    }

    throw new Error('Upload completed but failed to get file URL');
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}