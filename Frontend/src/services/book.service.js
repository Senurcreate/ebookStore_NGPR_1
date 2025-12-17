import axios from '../utils/axios';

// Get all books with optional query params
export const fetchBooks = async (params = {}) => {
    try {
        const response = await axios.get('/books', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
};

// Get a single book
export const fetchBookById = async (id) => {
    try {
        const response = await axios.get(`/books/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching book:", error);
        throw error;
    }
};

// Get New Releases (Sorted by creation date)
export const fetchNewReleases = async () => {
    try {
        // Based on your backend code, we can use sortBy=createdAt
        const response = await axios.get('/books?sortBy=createdAt&sortOrder=desc&limit=10');
        return response.data;
    } catch (error) {
        console.error("Error fetching new releases:", error);
        throw error;
    }
};

// 2. Best Sellers (Sorted by rating or trending flag)
export const fetchBestSellers = async () => {
    try {
        // You can sort by rating OR filter by trending=true
        const response = await axios.get('/books?sortBy=ratingStats.average&sortOrder=desc&limit=10');
        return response.data;
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        throw error;
    }
};

// 3. New Audiobooks (Filtered by type=audiobook)
export const fetchNewAudiobooks = async () => {
    try {
        const response = await axios.get('/books?type=audiobook&sortBy=createdAt&sortOrder=desc&limit=10');
        return response.data;
    } catch (error) {
        console.error("Error fetching audiobooks:", error);
        throw error;
    }
};