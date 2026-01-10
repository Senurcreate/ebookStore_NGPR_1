import axios from '../utils/axios';

// Get Dashboard Overview (Counts, Recent Activity)
export const fetchDashboardStats = async () => {
    try {
        const response = await axios.get('/admin/dashboard');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get Sales Analytics (Charts)
export const fetchSalesAnalytics = async (period = 'year') => {
    try {
        const response = await axios.get(`/admin/analytics/sales?period=${period}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchAllOrders = async () => {
    try {
        const response = await axios.get('/admin/export/sales');
        return response.data; // Returns { success: true, data: [...] }
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const suspendUser = async (userId, isDisabled) => {
    try {
        // Calls the existing PUT /api/admin/users/:id route
        const response = await axios.put(`/admin/users/${userId}`, { 
            disabled: isDisabled 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};