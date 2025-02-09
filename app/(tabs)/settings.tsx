import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import GradientBackground from "../../components/GradientBackground";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";

const Settings = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth().signOut();
      router.replace("/sign-in"); // ✅ Redirect to sign-in page after logout
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <GradientBackground>
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-white text-2xl font-semibold mb-6">Settings</Text>

        {/* ✅ Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white text-lg font-semibold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

export default Settings;