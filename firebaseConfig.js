import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Use Expo's environment variables (No need to import @env)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_FIREBASE_APP_ID_IOS
      : process.env.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID,
};

// ✅ Ensure Firebase is initialized only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Use the correct Auth initialization for each platform
const auth =
  Platform.OS === "web"
    ? getAuth(app) // Use Firebase Web SDK Auth for web
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export { auth, app };
