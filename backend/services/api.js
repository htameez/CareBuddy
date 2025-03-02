import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

// ✅ Automatically detect correct URL based on platform
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

export const api = {
  getUser: async (firebaseUID) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.get(`${BASE_URL}/users/${firebaseUID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.post(`${BASE_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      throw error;
    }
  },

  updateUserEHR: async (firebaseUID, ehrData) => {
    try {
      const token = await auth().currentUser?.getIdToken(true); // 🔐 Get Firebase token

      const response = await axios.put(
        `${BASE_URL}/users/${firebaseUID}/ehr`, // 🔹 API endpoint for EHR update
        { ehr: ehrData },
        {
          headers: { Authorization: `Bearer ${token}` }, // 🔐 Secure request
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error updating user EHR data:", error.response?.data || error.message);
      throw error;
    }
  },
};