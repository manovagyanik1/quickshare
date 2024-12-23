export const formatFileName = (): string => {
  const now = new Date();
  
  // Format: YYYY-MM-DD_HH-mm-ss
  const date = now.toISOString()
    .replace(/T/, '_')      // Replace T with underscore
    .replace(/\..+/, '')    // Remove milliseconds
    .replace(/:/g, '-');    // Replace colons with hyphens

  return `recording_${date}.webm`;
}; 