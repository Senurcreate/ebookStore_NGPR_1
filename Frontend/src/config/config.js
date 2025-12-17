// Configuration file for API URLs and settings - Vite Version
// Vite uses import.meta.env for environment variables

// Base API URL without trailing slash
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Cloudinary Cloud Name
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

// Default book cover image
export const DEFAULT_COVER_IMAGE = "https://plus.unsplash.com/premium_photo-1681554601855-e04b390b5a4a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Book types
export const BOOK_TYPES = {
    EBOOK: "ebook",
    AUDIOBOOK: "audiobook"
};

// API endpoints - make sure these match your backend routes
export const API_ENDPOINTS = {
    // Correct: Remove duplicate /api if your backend already includes it in routes
    BOOKS: `${API_BASE_URL}/api/books`,
    BOOK_BY_ID: (id) => `${API_BASE_URL}/api/books/${id}`,
    SEARCH_BOOKS: `${API_BASE_URL}/api/books/search/advanced`,
    UPLOAD_FILE: `${API_BASE_URL}/api/books/upload`,
    BOOK_STATS: `${API_BASE_URL}/api/books/stats/overall`,
    DOWNLOAD_PERMISSION: (id) => `${API_BASE_URL}/api/books/${id}/download-permission`,
    AUDIOBOOKS_BY_NARRATOR: (narrator) => `${API_BASE_URL}/api/books/audiobooks/narrator/${narrator}`,
    BOOKS_BY_TYPE: (type) => `${API_BASE_URL}/api/books/type/${type}`
};

// Helper function to handle API requests
export const apiRequest = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        console.log('API Request URL:', url); // Debug log
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Test the API connection
export const testApiConnection = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/books`);
        return response.ok;
    } catch (error) {
        console.error('API connection test failed:', error);
        return false;
    }
};