// utils/config.js

// Base API URL - Defaults to Port 3000 as you requested
const RAW_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// FIX: Just ensure we don't end with a slash
export const API_BASE_URL = RAW_URL.replace(/\/$/, "");

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
export const DEFAULT_COVER_IMAGE = "https://plus.unsplash.com/premium_photo-1681554601855-e04b390b5a4a?q=80&w=870&auto=format&fit=crop";

export const BOOK_TYPES = { EBOOK: "ebook", AUDIOBOOK: "audiobook" };

// Helper to prevent double "api/api"
// If API_BASE_URL already has /api, don't add it again.
const BASE_API = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export const API_ENDPOINTS = {
    BOOKS: `${BASE_API}/books`,
    BOOK_BY_ID: (id) => `${BASE_API}/books/${id}`,
    SEARCH_BOOKS: `${BASE_API}/books/search/advanced`,
    UPLOAD_FILE: `${BASE_API}/books/upload`,
    BOOK_STATS: `${BASE_API}/books/stats/overall`,
    DOWNLOAD_PERMISSION: (id) => `${BASE_API}/books/${id}/download-permission`,
    AUDIOBOOKS_BY_NARRATOR: (narrator) => `${BASE_API}/books/audiobooks/narrator/${narrator}`,
    BOOKS_BY_TYPE: (type) => `${BASE_API}/books/type/${type}`,
    
    // Review endpoints
    REVIEWS_BY_BOOK: (bookId) => `${BASE_API}/reviews/books/${bookId}`,
    ADD_REVIEW: (bookId) => `${BASE_API}/reviews/books/${bookId}`,
    ADD_REPLY: (reviewId) => `${BASE_API}/reviews/${reviewId}/reply`,
    EDIT_REVIEW: (reviewId) => `${BASE_API}/reviews/${reviewId}`,
    VOTE_REVIEW: (reviewId) => `${BASE_API}/reviews/${reviewId}/vote`,
    REPORT_REVIEW: (reviewId) => `${BASE_API}/reviews/${reviewId}/report`,
    DELETE_REVIEW: (reviewId) => `${BASE_API}/reviews/${reviewId}`
};

export const apiRequest = async (url, options = {}) => {
    const defaultOptions = {
        headers: { 'Content-Type': 'application/json', ...options.headers }
    };
    try {
        console.log('Requesting:', url); // Debug log
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

export const testApiConnection = async () => {
    try {
        const response = await fetch(`${BASE_API}/books`);
        return response.ok;
    } catch (error) { return false; }
};