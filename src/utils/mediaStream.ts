export const getScreenStream = async () => {
  return await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: "always" }
  });
};

export const getAudioStream = async () => {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  });
};

export const combineStreams = (screenStream: MediaStream, audioStream: MediaStream) => {
  return new MediaStream([
    ...screenStream.getVideoTracks(),
    ...audioStream.getAudioTracks()
  ]);
};