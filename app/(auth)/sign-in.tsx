import { View, Text, Dimensions, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormField from "@/components/FormField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import icons from "../../constants/icons";
import { Link } from "expo-router";
import auth from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

const { width, height } = Dimensions.get("window");

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Sign-in function using Firebase Authentication
  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(form.email, form.password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 relative">
      {/* ✅ Background Gradient Positioned Correctly */}
      <LinearGradient
        colors={["#3389BB", "rgba(35, 105, 146, 0.12)", "rgba(51, 137, 187, 0.00)"]}
        locations={[0, 0.7763, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          width: 237,
          height: 544,
          top: 0,
          left: (width - 237) / 2,
        }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAwareScrollView
          extraScrollHeight={100} // Adjust scrolling height to prevent top cutoff
          enableOnAndroid={true} // Ensures it works smoothly on Android
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full flex-1 justify-between items-center h-full relative px-4">
            {/* ✅ Title Positioned on Top */}
            <View className="w-full flex justify-start items-center pt-[10px]">
              <Text className="font-psemibold text-white text-[36px]">Login</Text>
              <Text className="font-iregular text-white text-[16px] pt-[4px]">
                Please Login to Continue
              </Text>
            </View>

            {/* ✅ Form Fields Positioned Near the Bottom */}
            <View className="w-full flex items-center justify-end gap-y-5 pb-[45px]">
              <FormField
                placeholder="Email"
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="w-[338px]"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={icons.user} 
              />
              <FormField
                placeholder="Password"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="w-[338px]"
                secureTextEntry
                icon={icons.lock} 
              />

              {/* ✅ Loading Indicator or Sign In Button */}
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="w-[338px]">
                  <Text
                    onPress={signIn}
                    className="text-center text-lg font-psemibold text-white bg-primaryLight py-3 rounded-lg"
                  >
                    Sign In
                  </Text>
                </View>
              )}

              <View className="flex-row items-center w-full justify-center mt-6">
                <View className="w-[80px] h-[1px] bg-white" />
                <Text className="text-white text-lg font-iregular mx-3">Or Login With</Text>
                <View className="w-[80px] h-[1px] bg-white" />
              </View>

              <SocialLoginButtons />

              <View className="flex justify-center pt-4 flex-row gap-1">
                <Text className="text-lg text-white font-pregular">
                  Don't have an account?
                </Text>
                <Link href="/sign-up" className="text-lg font-psemibold text-white">
                  Register
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignIn;