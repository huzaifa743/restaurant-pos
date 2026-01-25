// Utility function to get the base URL for API and static files
export const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // If VITE_API_URL is like '/api' or 'http://localhost:5000/api', extract base
    if (apiUrl.startsWith('http')) {
      // Full URL like 'http://localhost:5000/api' -> 'http://localhost:5000'
      return apiUrl.replace('/api', '');
    } else if (apiUrl.startsWith('/api')) {
      // Relative URL like '/api' -> '' (empty, use relative paths)
      return '';
    }
    return apiUrl.replace('/api', '');
  }
  if (import.meta.env.PROD) {
    return ''; // Relative URL in production
  }
  return 'http://localhost:5000'; // Local development
};

// Helper to get full URL for uploads/images
export const getImageURL = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path; // Already full URL
  if (path.startsWith('data:')) return path; // Data URL (base64)
  
  const baseURL = getBaseURL();
  // Ensure path starts with / if baseURL is empty (relative path)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If baseURL is empty, return relative path
  if (!baseURL) {
    return normalizedPath;
  }
  
  // Combine baseURL and path, avoiding double slashes
  const url = `${baseURL}${normalizedPath}`;
  return url;
};
