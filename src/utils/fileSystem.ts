import { oneDriveService } from '../services/oneDrive';

export const saveRecording = async (blob: Blob, useOneDrive: boolean) => {
  try {
    if (useOneDrive) {
      console.log('Attempting to save to OneDrive...'); // Debug log
      const fileName = `recording-${Date.now()}.webm`;
      await oneDriveService.uploadFile(blob, fileName, (progress) => {
        console.log('Upload progress:', progress); // Debug log
      });
      console.log('Successfully saved to OneDrive'); // Debug log
    } else {
      // Local download logic
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};