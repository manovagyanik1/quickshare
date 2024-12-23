export const AUTH_CONFIG = {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID as string,
  redirectUri: 'http://localhost:5173/auth-callback',
  scopes: ['Files.ReadWrite', 'Files.ReadWrite.All', 'offline_access'],
  authority: 'https://login.microsoftonline.com/common',
};