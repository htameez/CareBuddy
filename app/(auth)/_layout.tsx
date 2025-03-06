import { Image, View, Dimensions } from "react-native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import images from "../../constants/images";

const { height, width } = Dimensions.get("window"); // Get screen height & width

const AuthLayout = () => {
  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "transparent", // Ensures Stack content is transparent
          },
        }}
      >
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="connect-ehr"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ehr-callback"
          options={{
            headerShown: false,
          }}
        /> */}
      </Stack>

      {/* ✅ Glow Effect Positioned Behind Everything */}
      <View
        style={{ height: height * 0.4 }}
        className="absolute bottom-0 left-0 right-0 -z-10" // 👈 Pushes it to the background
        pointerEvents="none" // 👈 Prevents it from blocking interactions
      >
        <Image
          source={images.glow}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default AuthLayout;
