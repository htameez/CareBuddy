import { View, Image, TouchableOpacity } from "react-native";
import React from "react";
import icons from "../constants/icons"; // Ensure this path is correct

const SocialLoginButtons = () => {
  return (
    <View className="flex-row justify-center items-center mt-4" style={{ gap: 33 }}>
      {/* ✅ Google Button */}
      <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center">
        <Image source={icons.google} className="w-[40px] h-[40px]" resizeMode="contain" />
      </TouchableOpacity>

      {/* ✅ Facebook Button */}
      <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center">
        <Image source={icons.facebook} className="w-[45px] h-[45px]" resizeMode="contain" />
      </TouchableOpacity>

      {/* ✅ Apple Button */}
      <TouchableOpacity className="w-[60px] h-[60px] bg-white rounded-full flex justify-center items-center">
        <Image source={icons.apple} className="w-[40px] h-[40px]" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SocialLoginButtons;