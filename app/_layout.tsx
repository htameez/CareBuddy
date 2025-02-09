import { SplashScreen, Stack } from 'expo-router';
import GradientBackground from "../components/GradientBackground";
import { useFonts } from 'expo-font';
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import * as NavigationBar from 'expo-navigation-bar'; // ✅ Import expo-navigation-bar
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

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) SplashScreen.hideAsync();

    if (Platform.OS === 'android') {
      // ✅ Hide the status bar
      StatusBar.setHidden(true);

      // ✅ Make navigation bar fully transparent but keep gesture bar visible
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)"); // Fully transparent background
      NavigationBar.setBehaviorAsync("inset-swipe"); // Keeps the small navigation indicator at the bottom
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <GradientBackground>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "transparent", // Ensures Stack content is transparent
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

