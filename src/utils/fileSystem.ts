export const saveRecording = async (blob: Blob) => {
  try {
    const suggestedName = `screen-recording-${Date.now()}.webm`;
    
    // Use the File System Access API to save the file
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