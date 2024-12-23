export const createMediaRecorder = (stream: MediaStream) => {
  return new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9,opus'
  });
};