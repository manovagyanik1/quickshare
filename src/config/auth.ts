const getRedirectUri = () => {
  // In development, use the environment variable
  if (import.meta.env.DEV) {
    const redirectUri = import.meta.env.VITE_REDIRECT_URI as string;
    console.log('Development Redirect URI:', redirectUri);
    return redirectUri;
  }
  
  // In production, construct the URI from window.location
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const redirectUri = `${baseUrl}/auth-callback`;
  console.log('Production Redirect URI:', redirectUri);
  return redirectUri;
};

export const AUTH_CONFIG = {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID as string,
  redirectUri: getRedirectUri(),
  scopes: ['Files.ReadWrite', 'Files.ReadWrite.All', 'offline_access'],
  authority: 'https://login.microsoftonline.com/common',
};

// Log full auth config for debugging
console.log('Auth Configuration:', {
  ...AUTH_CONFIG,
  clientId: AUTH_CONFIG.clientId ? 'Present' : 'Missing',
  environment: import.meta.env.DEV ? 'Development' : 'Production',
  windowLocation: {
    protocol: window.location.protocol,
    host: window.location.host,
    pathname: window.location.pathname
  }
});