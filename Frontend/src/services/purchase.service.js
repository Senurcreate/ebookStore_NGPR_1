import axios from '../utils/axios'; 

// 1. Simulate a Purchase
export const simulatePurchase = async (bookId) => {
    try {
        const response = await axios.post('/purchases/simulate', { bookId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// 2. Get Download History
export const fetchDownloadHistory = async () => {
    try {
        const response = await axios.get('/downloads/history');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};



// 3. Get My Purchases (Library)
export const fetchMyPurchases = async () => {
    try {
        const response = await axios.get('/users/me/purchases');
        return response.data;
    } catch (error) {
        console.error("Error fetching purchases:", error);
        throw error.response?.data || error.message;
    }
};

// 4. Secure Download Trigger
export const downloadBookFile = async (bookId) => {
    try {
        const response = await axios.post(`/downloads/${bookId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const response = await axios.patch(`/purchases/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};