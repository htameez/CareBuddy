import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ✅ Use Expo's environment variables
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

// ✅ Ensure Firebase App is initialized only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Use the correct Auth initialization for Web and Mobile
const auth = 
  Platform.OS === "web"
    ? getAuth(app) // ✅ Web: Use getAuth()
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }); // ✅ Mobile: Use initializeAuth()

export { auth, app };
