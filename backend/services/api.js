import axios from "axios";
import auth from "@react-native-firebase/auth";
import { Platform } from "react-native";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api");

export const api = {
  getUser: async (firebaseUID) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.get(`${BASE_URL}/users/${firebaseUID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching user info:", error.response?.data || error.message);
      throw error;
    }
  },

  createUser: async (userData, tokenOverride) => {
    try {
      const token = tokenOverride || await auth().currentUser?.getIdToken(true);
      const response = await axios.post(`${BASE_URL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error creating user:", error.response?.data || error.message);
      throw error;
    }
  },

  updateUserEHR: async (firebaseUID, ehrData) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);

      const response = await axios.put(
        `${BASE_URL}/users/${firebaseUID}/ehr`,
        ehrData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error updating user EHR data:", error.response?.data || error.message);
      throw error;
    }
  },

  updateUserProfile: async (firebaseUID, profileData) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.put(
        `${BASE_URL}/users/${firebaseUID}/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error updating user profile:", error.response?.data || error.message);
      throw error;
    }
  },

  syncRedoxEHR: async (firebaseUID, searchParams) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.post(
        `${BASE_URL}/users/${firebaseUID}/ehr/redox-sync`,
        searchParams,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error syncing Redox EHR data:", error.response?.data || error.message);
      throw error;
    }
  },

  debugRedoxDocuments: async (firebaseUID, searchParams) => {
    try {
      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.post(
        `${BASE_URL}/users/${firebaseUID}/ehr/redox-documents-debug`,
        searchParams,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error debugging Redox documents:", error.response?.data || error.message);
      throw error;
    }
  },

  sendChatMessage: async (firebaseUID, messages) => {
    try {
      if (!firebaseUID) throw new Error("❌ Missing firebaseUID when sending chat message.");
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("❌ Messages must be a non-empty array.");
      }

      const token = await auth().currentUser?.getIdToken(true);
      const response = await axios.post(
        `${BASE_URL}/chat`,
        { firebaseUID, messages },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.response;
    } catch (error) {
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";

      console.error("❌ Error sending chat message:", backendMsg);

      // Keep your UI behavior the same
      return "I'm having trouble processing your request.";
    }
  },
};
