import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import GradientBackground from "../components/GradientBackground";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Track onboarding status
import * as NavigationBar from "expo-navigation-bar";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/static/Inter-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter/static/Inter-Regular.ttf"),
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
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
  const subscriber = auth().onAuthStateChanged((user) => {
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

// ✅ Delay navigation to avoid "navigate before mounting" error
useEffect(() => {
  if (initializing || onboardingCompleted === null) return;

  const inAuthGroup = segments[0] === "(auth)";

  setTimeout(async () => {
    if (!onboardingCompleted) {
      return; // ✅ Stay on onboarding (`index.tsx`)
    } 
    
    if (user) {
      if (isNewUser) {
        await AsyncStorage.setItem("onboardingCompleted", "true"); // ✅ Save onboarding state
        router.replace("/home"); // ✅ Redirect new users to home
      } else if (!user.emailVerified) {
        auth().signOut();
        router.replace("/sign-in");
        alert("Please verify your email before logging in.");
      } else {
        await AsyncStorage.setItem("onboardingCompleted", "true"); // ✅ Ensure onboarding is marked complete
        router.replace("/home"); // ✅ Redirect authenticated users to home
      }
    } else if (!user && !inAuthGroup) {
      router.replace("/sign-in"); // ✅ Redirect logged-out users to sign-in
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
  <GradientBackground>
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
  </GradientBackground>
);
};

export default RootLayout;

