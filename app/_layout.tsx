import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import GradientBackground from "../components/GradientBackground";
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, StatusBar } from "react-native";
import * as NavigationBar from 'expo-navigation-bar';
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    // Poppins Fonts
    "Poppins-Black": require("../assets/fonts/Poppins/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins/Poppins-Thin.ttf"),

    // Inter Fonts
    "Inter-Black": require("../assets/fonts/Inter/static/Inter-Black.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter/static/Inter-Bold.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter/static/Inter-ExtraBold.ttf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter/static/Inter-ExtraLight.ttf"),
    "Inter-Light": require("../assets/fonts/Inter/static/Inter-Light.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter/static/Inter-Medium.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter/static/Inter-Regular.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter/static/Inter-SemiBold.ttf"),
    "Inter-Thin": require("../assets/fonts/Inter/static/Inter-Thin.ttf"),
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) SplashScreen.hideAsync();

    if (Platform.OS === 'android') {
      StatusBar.setHidden(true);
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)");
      NavigationBar.setBehaviorAsync("inset-swipe");
    }
  }, [fontsLoaded, error]);

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
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (user) {
        if (isNewUser) {
          router.replace("/home"); // ✅ Redirect new users to home
        } else if (!user.emailVerified) {
          auth().signOut();
          router.replace("/sign-in");
          alert("Please verify your email before logging in.");
        } else {
          router.replace("/home"); // ✅ Redirect authenticated users to home
        }
      } else if (!user && !inAuthGroup) {
        router.replace("/sign-in"); // ✅ Redirect logged-out users to sign-in
      }
    }, 500); // ✅ Small delay ensures navigation only happens **after** the layout is fully mounted

  }, [user, initializing, isNewUser]);

  // ✅ Show loading screen while checking auth state
  if (!fontsLoaded || initializing) {
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

