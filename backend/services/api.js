// backend/services/api.js
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const BASE_URL = 'http://localhost:5001/api'; // ✅ Correct Backend URL

export const api = {
  // ✅ Fetch User from MongoDB
  getUser: async (firebaseUID) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.get(`${BASE_URL}/users/${firebaseUID}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Secure Request
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Create or Update User in MongoDB
  createUser: async (userData) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.post(`${BASE_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      throw error;
    }
  },
};