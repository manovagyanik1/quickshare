import { oneDriveService } from '../services/oneDrive';

export const saveRecording = async (blob: Blob, useOneDrive = false) => {
  try {
    if (useOneDrive) {
      const fileName = `screen-recording-${Date.now()}.webm`;
      await oneDriveService.uploadFile(blob, fileName);
      return;
    }

    // Default local save behavior
    const suggestedName = `screen-recording-${Date.now()}.webm`;
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{
        description: 'WebM Video',
        accept: {
          'video/webm': ['.webm']
        }
      }]
    });
    
    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};