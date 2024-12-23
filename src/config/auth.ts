const getRedirectUri = () => {
  // In development, use the environment variable
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_REDIRECT_URI as string;
  }
  
  // In production, construct the URI from window.location
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  return `${baseUrl}/auth-callback`;
};

export const AUTH_CONFIG = {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID as string,
  redirectUri: getRedirectUri(),
  scopes: ['Files.ReadWrite', 'Files.ReadWrite.All', 'offline_access'],
  authority: 'https://login.microsoftonline.com/common',
};