export const addVideoMetadata = async (blob: Blob, duration: number): Promise<Blob> => {
  // Create a new MediaRecorder to get the proper MIME type
  const mediaStream = new MediaStream();
  const recorder = new MediaRecorder(mediaStream);
  const mimeType = recorder.mimeType || 'video/webm';

  // Create metadata
  const metadata = {
    duration,
    lastModified: new Date().toISOString(),
    type: mimeType,
  };

  // Create a new Blob with metadata
  return new Blob([blob], {
    type: mimeType,
    lastModified: Date.now(),
  });
}; 