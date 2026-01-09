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
        // sortBy=createdAt
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
        // sort by rating OR filter by trending=true
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

// 4. Filter Options (ebook & audiobook)

export const fetchFilterOptions = async () => {
    try {
        const response = await axios.get('/books/filters');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return null; 
    }
};