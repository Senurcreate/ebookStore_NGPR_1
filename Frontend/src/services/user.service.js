import axios from '../utils/axios'; // Use your configured axios instance

// Get User Profile
export const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/users/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update Profile (Name, Photo, etc)
export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put('/users/me', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Change Password
export const changeUserPassword = async (newPassword) => {
  try {
    const response = await axios.patch('/users/me/password', { newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};