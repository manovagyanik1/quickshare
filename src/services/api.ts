export const API_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string will use relative paths
  : 'http://localhost:3000';

export const getApiUrl = (path: string) => {
  return `${API_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
}; 