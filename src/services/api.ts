const isProd = import.meta.env.PROD;

export const API_CONFIG = {
  BASE_URL: isProd 
    ? '/api'
    : 'http://localhost:3000/api',
  ENDPOINTS: {
    VIDEOS: '/videos',
    VIDEO_DETAILS: (id: string) => `/videos/${id}`,
    VIDEO_URL: (id: string) => `/videos/${id}/url`,
    HEALTH: '/health'
  }
};

export const getApiUrl = (path: string) => {
  // For development, add /api prefix
  return `${API_CONFIG.BASE_URL}${path}`;
};
