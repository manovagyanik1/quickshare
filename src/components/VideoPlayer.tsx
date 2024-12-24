// Update the shareVideo method in VideoPlayer component
const shareVideo = () => {
  // Share the video ID instead of the download URL
  const shareUrl = `${window.location.origin}/video/${video.id}`;
  navigator.clipboard.writeText(shareUrl);
  toast.success('Video link copied to clipboard!');
};