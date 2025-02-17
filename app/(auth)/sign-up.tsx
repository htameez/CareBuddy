import { View, Text, Dimensions, Alert, TextInput, ActivityIndicator } from "react-native";
import React, { useState, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormField from "@/components/FormField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import icons from "../../constants/icons";
import { Link, useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../backend/services/api";

const { width } = Dimensions.get("window");

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Refs for input navigation
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // ✅ Sign-Up Function
  const handleSignUp = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
  
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(form.email, form.password);
      const user = userCredential.user;
  
      // ✅ Create User in MongoDB
      await api.createUser({
        firebaseUID: user.uid,
        name: form.name,
        email: form.email,
        photoURL: user.photoURL || '',
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          lastUpdate: new Date()
        }
      });
  
      // ✅ Save to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        name: form.name,
        email: form.email,
      }));
  
      if (user) {
        await user.sendEmailVerification();
        Alert.alert("Verify Your Email", "A verification email has been sent.");
        auth().signOut();
        router.replace("/sign-in");
      }
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 relative">
      {/* ✅ Background Gradient */}
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
          extraScrollHeight={100}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full flex-1 justify-between items-center h-full relative px-4">
            {/* ✅ Title */}
            <View className="w-full flex justify-start items-center pt-[10px]">
              <Text className="font-psemibold text-white text-[36px]">Register</Text>
              <Text className="font-iregular text-white text-[16px] pt-[4px]">
                Please Register to Continue
              </Text>
            </View>

            {/* ✅ Form Fields */}
            <View className="w-full flex items-center justify-end gap-y-5 pb-[12%]">
              <FormField
                placeholder="Full Name"
                value={form.name}
                handleChangeText={(e) => setForm({ ...form, name: e })}
                otherStyles="w-[90%]"
                icon={icons.user}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()} // ✅ Move to email field
                blurOnSubmit={false}
              />

              <FormField
                placeholder="Email"
                value={form.email}
                handleChangeText={(e) => setForm({ ...form, email: e })}
                otherStyles="w-[90%]"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={icons.user}
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()} // ✅ Move to password field
                blurOnSubmit={false}
              />

              <FormField
                placeholder="Password"
                value={form.password}
                handleChangeText={(e) => setForm({ ...form, password: e })}
                otherStyles="w-[90%]"
                secureTextEntry
                icon={icons.lock}
                ref={passwordRef}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()} // ✅ Move to confirm password
                blurOnSubmit={false}
              />

              <FormField
                placeholder="Confirm Password"
                value={form.confirmPassword}
                handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
                otherStyles="w-[90%]"
                secureTextEntry
                icon={form.password === form.confirmPassword && form.password !== "" ? icons.checkmark : icons.lock} // ✅ Check if passwords match
                ref={confirmPasswordRef}
                returnKeyType="done"
                onSubmitEditing={handleSignUp} // ✅ Submit form on return
              />

              {/* ✅ Register Button */}
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="w-[90%]">
                  <Text
                    onPress={handleSignUp}
                    className="text-center text-lg font-psemibold text-white bg-primaryLight py-3 rounded-lg"
                  >
                    {loading ? "Registering..." : "Register"}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center w-full justify-center mt-6">
                <View className="w-[21.5%] h-[1px] bg-white" />
                <Text className="text-white text-lg font-iregular mx-3">Or Register With</Text>
                <View className="w-[21.5%] h-[1px] bg-white" />
              </View>
              <SocialLoginButtons />

              <View className="flex justify-center pt-4 flex-row gap-2">
                <Text className="text-lg text-white font-pregular">
                  Already have an account?
                </Text>
                <Link href="/sign-in" className="text-lg font-psemibold text-white">
                  Log In
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SignUp;