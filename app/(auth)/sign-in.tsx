import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const SignIn = () => {
  return (
    <SafeAreaView className="flex-1 relative">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full flex justify-start items-center h-full relative">
          
          {/* ✅ Background Gradient with Correct Size (237x544 px) */}
          <LinearGradient
            colors={["#3389BB", "rgba(35, 105, 146, 0.12)", "rgba(51, 137, 187, 0.00)"]}
            locations={[0, 0.7763, 1]} // Gradient stops
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              width: 237, // Fixed width
              height: 544, // Fixed height
              top: 0, // Push to top
              alignSelf: "center", // Centers the gradient
            }}
          />

          {/* ✅ Text on Top of Gradient */}
          <View className="w-full flex justify-start items-center pt-[30px]">
            <Text className="font-psemibold text-white text-[36px]">Login</Text>
            <Text className="font-iregular text-white text-[16px] pt-[4px]">
              Please Login to Continue
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;