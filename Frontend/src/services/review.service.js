import axios from '../utils/axios';

// Get Moderation Dashboard (Reported & Hidden reviews)
export const fetchModerationQueue = async () => {
    try {
        const response = await axios.get('/admin/moderation');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Approve Review (Clear Reports)
export const approveReview = async (id) => {
    try {
        const response = await axios.delete(`/reviews/admin/${id}/reports`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Hide/Unhide Review
export const toggleHideReview = async (id, isHidden, reason = "Moderated") => {
    try {
        const response = await axios.patch(`/reviews/admin/${id}/hide`, { isHidden, reason });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete Review
export const deleteReview = async (id) => {
    try {
        const response = await axios.delete(`/reviews/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const fetchAllReviews = async () => {
    try {
        const response = await axios.get('/admin/reviews/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};