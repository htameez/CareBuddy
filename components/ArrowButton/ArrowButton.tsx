import React from "react";
import { Text, TouchableOpacity, Image, View } from "react-native";

const arrowImage = require("./right-arrow.png"); // Ensure the correct path

interface ArrowButtonProps {
  handlePress: () => void;
  text?: string; // Optional text next to button
  isDisabled?: boolean; // Optional disabled state
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ handlePress, text, isDisabled = false }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex flex-row items-center space-x-3 p-2 ${
        isDisabled ? "opacity-50" : ""
      }`}
      accessibilityRole="button"
      accessibilityLabel={text ? text : "Right arrow button"}
      disabled={isDisabled}
    >
      {/* Optional text */}
      {text && <Text className="text-lg font-iregular text-white pr-2">{text}</Text>}

      {/* Arrow Button */}
      <View className="w-16 h-16">
        <Image
          source={arrowImage}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ArrowButton;