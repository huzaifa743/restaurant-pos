// Utility function to get the base URL for API and static files
export const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  if (import.meta.env.PROD) {
    return ''; // Relative URL in production
  }
  return 'http://localhost:5000'; // Local development
};

// Helper to get full URL for uploads/images
export const getImageURL = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already full URL
  const baseURL = getBaseURL();
  return `${baseURL}${path}`;
};
