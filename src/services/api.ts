const getBaseUrl = () => {
  // Always use VITE_API_URL if it exists
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to localhost in development
  return 'http://localhost:3000';
};

export const API_URL = getBaseUrl();

export const getApiUrl = (path: string) => {
  // If API_URL is just '/api', don't add another '/api'
  if (API_URL === '/api') {
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return `${API_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
}; 