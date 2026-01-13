import axios from 'axios';
import { auth } from '../firebase/firebase.config'; 
import { API_BASE_URL } from '../config/config'; 

const instance = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:3000/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

// REQUEST INTERCEPTOR
// This runs before every API call
instance.interceptors.request.use(async (config) => {
    // Check if a user is logged in
    const user = auth.currentUser;

    if (user) {
        try {
            // Get the specific ID token (JWT)
            // forceRefresh = false means use cached token if valid
            const token = await user.getIdToken(false);
            
            // Attach it to the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
            // console.log("Token attached:", token.substring(0, 10) + "..."); // Debugging
        } catch (error) {
            console.error("Error getting token:", error);
        }
    } else {
        console.warn("No user logged in, request sent without token");
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR (Optional: Handle 401 globally)
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Token might be invalid.");
            // Optional: Logout user or redirect to login
        }
        return Promise.reject(error);
    }
);

export default instance;