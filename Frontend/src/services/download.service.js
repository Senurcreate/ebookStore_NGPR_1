import axios from '../utils/axios'; 

// 1. Get Download History (Paginated)
export const fetchDownloadHistory = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`/downloads/history?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 2. Get Download Statistics
export const fetchDownloadStats = async () => {
    try {
        const response = await axios.get('/downloads/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 3. Clear History
export const clearHistory = async () => {
    try {
        const response = await axios.delete('/downloads/history');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};