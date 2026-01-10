import axios from '../utils/axios';

// Get User's Wishlist (with pagination)
export const fetchWishlist = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`/wishlist?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        throw error;
    }
};

// Add to Wishlist
export const addToWishlist = async (bookId) => {
    try {
        const response = await axios.post('/wishlist/add', { bookId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Remove from Wishlist (using Wishlist Item ID - for the Grid)
export const removeFromWishlist = async (wishlistItemId) => {
    try {
        const response = await axios.delete(`/wishlist/${wishlistItemId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Remove from Wishlist (using Book ID - for the Book Details Page)
export const removeByBookId = async (bookId) => {
    try {
        const response = await axios.delete(`/wishlist/book/${bookId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Check if a specific book is in wishlist
export const checkInWishlist = async (bookId) => {
    try {
        const response = await axios.get(`/wishlist/check/${bookId}`);
        return response.data; // Returns { isInWishlist: true/false, wishlistItem: ... }
    } catch (error) {
        console.error("Error checking wishlist status:", error);
        return { isInWishlist: false };
    }
};