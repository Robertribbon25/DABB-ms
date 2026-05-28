import axios from 'axios';

// Resolve Backend Base URL dynamically
const getBaseURL = () => {
  // If running locally, check if we're on port 5173 (standard standalone Vite)
  // or connected in a separate backend mode.
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // In local separate client/server mode
    if (port === '5173') {
      return 'http://localhost:5000/api';
    }
  }
  // Default to relative API route which will be handled by our integrated Express server in CI/Sandbox
  return '/api';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-inject Token Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('dab_enterprise_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Error parsing auth storage token', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Error Interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear user session gracefully
      console.warn('Authentication token expired. Logging out.');
      localStorage.removeItem('dab_enterprise_user');
      // If we are on login, don't trigger cyclical redirect
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
