import { View, Image, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { GoogleSignin, statusCodes, User } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import icons from "../constants/icons";
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

// ✅ Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "568471222853-mg3gi9s228gqs1cdhm7fcbtm4hkm0hsk.apps.googleusercontent.com", // Replace with your Web Client ID from Firebase Console
});

const SocialLoginButtons: React.FC = () => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error("Google authentication failed - No ID token received.");
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
      const firebaseToken = await user.getIdToken();

      await axios.post(`${BASE_URL}/users`, {
        firebaseUID: user.uid,
        name: user.displayName,
        email: user.email,
      }, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
      });

      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Error", `Google Sign-In failed: ${error.message}`);
    }
  };


  return (
    <View className="flex-row justify-center items-center mt-4" style={{ gap: 33 }}>
      {/* ✅ Google Button */}
      <TouchableOpacity
        className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center"
        onPress={handleGoogleSignIn}
      >
        <Image source={icons.google} className="w-[40px] h-[40px]" resizeMode="contain" />
      </TouchableOpacity>

      {/* ✅ Facebook Button (Placeholder) */}
      <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center">
        <Image source={icons.facebook} className="w-[45px] h-[45px]" resizeMode="contain" />
      </TouchableOpacity>

      {/* ✅ Apple Button (Placeholder) */}
      <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center">
        <Image source={icons.apple} className="w-[40px] h-[40px]" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SocialLoginButtons;