import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import GradientBackground from "../components/GradientBackground";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Track onboarding status
import * as NavigationBar from "expo-navigation-bar";
//import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import "../global.css";
import { auth } from "../firebaseConfig";
import { User } from "firebase/auth";

SplashScreen.preventAutoHideAsync();

export const linking = {
  prefixes: ["carebuddy://"],
  config: {
    screens: {
      index: "index",
      "(auth)": {
        screens: {
          signIn: "sign-in",
          signUp: "sign-up",
          "connect-ehr": "connect-ehr", // User starts Epic login here
          "ehr-callback": "ehr-callback", // Only navigates here after login
        },
      },
      "(tabs)": {
        screens: {
          home: "home",
          chats: "chats",
          favorites: "favorites",
          settings: "settings",
        },
      },
    },
  },
};


const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/static/Inter-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter/static/Inter-Regular.ttf"),
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();

    if (Platform.OS === "android") {
      StatusBar.setHidden(true);
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)");
      NavigationBar.setBehaviorAsync("inset-swipe");
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    const checkOnboarding = async () => {
      // ✅ Reset onboarding in dev mode
      if (__DEV__) {
        await AsyncStorage.removeItem("onboardingCompleted");
        console.log("🔄 Dev Mode: Reset onboarding state.");
      }

      const hasCompleted = await AsyncStorage.getItem("onboardingCompleted");
      setOnboardingCompleted(hasCompleted === "true");
    };

    checkOnboarding();
  }, []);

  // ✅ Listen for authentication state changes
  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setIsNewUser(user.metadata.creationTime === user.metadata.lastSignInTime);
      } else {
        setUser(null);
        setIsNewUser(false);
      }
      if (initializing) setInitializing(false);
    });

    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing || onboardingCompleted === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    setTimeout(async () => {
      if (!onboardingCompleted) {
        return; // ✅ Stay on onboarding (`index.tsx`)
      }

      if (user) {
        if (!user.emailVerified) {
          auth.signOut();
          router.replace("/sign-in");
          alert("Please verify your email before logging in.");
          return;
        }

        // ✅ Retrieve user data from AsyncStorage
        const userData = await AsyncStorage.getItem("user");
        const userJSON = userData ? JSON.parse(userData) : null;
        const hasEHRConnected = userJSON?.ehr?.epicPatientID ? true : false;

        // ✅ Redirect new users or those without EHR to `/connect-ehr`
        if (isNewUser || !hasEHRConnected) {
          console.log("🔹 Redirecting user to connect EHR...");
          router.replace("/connect-ehr");
        } else {
          await AsyncStorage.setItem("onboardingCompleted", "true");
          router.replace("/home");
        }
      } else if (!user && !inAuthGroup) {
        router.replace("/sign-in");
      }
    }, 500);
  }, [user, initializing, isNewUser, onboardingCompleted]);

  // ✅ Show loading screen while checking auth state
  if (!fontsLoaded || initializing || onboardingCompleted === null) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;

