import { View, Text, ScrollView, Dimensions, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import FormField from "@/components/FormField";
import images from "../../constants/images";

const { width } = Dimensions.get("window"); // Get screen width for centering

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <View className="flex-1 relative">
      {/* ✅ Background Gradient Positioned Correctly */}
      <LinearGradient
        colors={["#3389BB", "rgba(35, 105, 146, 0.12)", "rgba(51, 137, 187, 0.00)"]}
        locations={[0, 0.7763, 1]} // Gradient stops
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          width: 237, // Fixed width
          height: 544, // Fixed height
          top: 0, // Positioned at the top
          left: (width - 237) / 2, // Centers the gradient horizontally
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="w-full flex justify-start items-center h-full relative">
            {/* ✅ Text Positioned on Top of Gradient */}
            <View className="w-full flex justify-start items-center pt-[10px]">
              <Text className="font-psemibold text-white text-[36px]">Login</Text>
              <Text className="font-iregular text-white text-[16px] pt-[4px]">
                Please Login to Continue
              </Text>
            </View>

            {/* ✅ Form Fields with Icons */}
            <View className="w-full flex items-center justify-center mt-8 px-4">
              <FormField
                placeholder="Email"
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="w-[338px] mt-7"
                keyboardType="email-address"
                icon={images.userIcon} // 👤 User icon
              />
              <FormField
                placeholder="Password"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="w-[338px] mt-5"
                secureTextEntry
                icon={images.lockIcon} // 🔒 Lock icon
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignIn;