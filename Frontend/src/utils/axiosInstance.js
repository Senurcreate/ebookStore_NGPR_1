import axios from 'axios';
import { auth } from '../firebase/firebase.config'; 

// Use explicit IPv4 to avoid localhost issues
const baseURL = 'http://127.0.0.1:3000/api'; 

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor 
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor for Error Handling ---
axiosInstance.interceptors.response.use(
  (response) => response, // Return successful responses directly
  (error) => {
    // Check for 403 Forbidden (Admin Only) or 401 Unauthorized
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.warn("⛔ Access Denied. Redirecting...");
      
      // Optional: Redirect to login or home if strictly necessary
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;