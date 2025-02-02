import React from "react";
import { Text, TouchableOpacity, Image, View } from "react-native";
const arrowImage = require("./right-arrow.png"); // ✅ Fixes TypeScript error

interface ArrowButtonProps {
  onPress: () => void;
  text?: string; // Optional text next to button
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ onPress, text }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7} // Slight opacity change on press
      className={"flex flex-row items-center space-x-3 p-2"}
      accessibilityRole="button"
      accessibilityLabel={text ? text : "Right arrow button"}
    >
      {/* Optional text */}
      {text && <Text className="text-lg font-iregular text-white pr-2">{text}</Text>}

      {/* Arrow Button */}
      <View className="w-16 h-16 bg-transparent rounded-full shadow-lg">
        <Image
          source={arrowImage}
          className="w-full h-full rounded-full"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ArrowButton;