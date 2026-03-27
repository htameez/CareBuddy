import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import GradientBackground from "../../components/GradientBackground";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../backend/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_WEIGHT_LENGTH = 40;
const MAX_HEIGHT_LENGTH = 20;
const MAX_HEALTH_GOALS_LENGTH = 400;

const Settings = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    healthGoals: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const firebaseUID = auth().currentUser?.uid;
        if (!firebaseUID) return;

        const user = await api.getUser(firebaseUID);
        setForm({
          age: user?.profile?.age ? String(user.profile.age) : "",
          weight: user?.profile?.weight || "",
          height: user?.profile?.height || "",
          healthGoals: user?.profile?.healthGoals || "",
        });
      } catch (error) {
        console.error("❌ Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleChange = (field: keyof typeof form, value: string) => {
    let nextValue = value;

    if (field === "age") {
      nextValue = value.replace(/[^0-9]/g, "").slice(0, 3);
    }

    if (field === "weight") {
      nextValue = value.replace(/[^a-zA-Z0-9.,'"\-\/() %]/g, "").slice(0, MAX_WEIGHT_LENGTH);
    }

    if (field === "height") {
      nextValue = value.replace(/[^a-zA-Z0-9.'"\-\/ ]/g, "").slice(0, MAX_HEIGHT_LENGTH);
    }

    if (field === "healthGoals") {
      nextValue = value.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, MAX_HEALTH_GOALS_LENGTH);
    }

    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSave = async () => {
    try {
      const firebaseUID = auth().currentUser?.uid;
      if (!firebaseUID) {
        Alert.alert("Error", "No authenticated user found.");
        return;
      }

      const age = form.age ? Number(form.age) : null;
      if (age !== null && (!Number.isInteger(age) || age < 0 || age > 120)) {
        Alert.alert("Invalid age", "Age must be a whole number between 0 and 120.");
        return;
      }

      setSaving(true);
      const updatedUser = await api.updateUserProfile(firebaseUID, {
        age,
        weight: form.weight.trim(),
        height: form.height.trim(),
        healthGoals: form.healthGoals.trim(),
      });

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error: any) {
      Alert.alert("Save failed", error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

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
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-white text-3xl font-semibold mb-2">Settings</Text>
          <Text className="text-white/70 text-base mb-8">
            Update the personal details CareBuddy can use for more relevant support.
          </Text>

          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="gap-y-4">
              <View>
                <Text className="text-white text-base mb-2">Age</Text>
                <TextInput
                  value={form.age}
                  onChangeText={(value) => handleChange("age", value)}
                  keyboardType="number-pad"
                  placeholder="Enter your age"
                  placeholderTextColor="#94A3B8"
                  maxLength={3}
                  className="rounded-3xl bg-black/50 border border-white/15 px-4 py-4 text-white"
                />
              </View>

              <View>
                <Text className="text-white text-base mb-2">Weight</Text>
                <TextInput
                  value={form.weight}
                  onChangeText={(value) => handleChange("weight", value)}
                  placeholder="e.g. 145 lb"
                  placeholderTextColor="#94A3B8"
                  maxLength={MAX_WEIGHT_LENGTH}
                  className="rounded-3xl bg-black/50 border border-white/15 px-4 py-4 text-white"
                />
              </View>

              <View>
                <Text className="text-white text-base mb-2">Height</Text>
                <TextInput
                  value={form.height}
                  onChangeText={(value) => handleChange("height", value)}
                  placeholder={'e.g. 5\'6"'}
                  placeholderTextColor="#94A3B8"
                  maxLength={MAX_HEIGHT_LENGTH}
                  className="rounded-3xl bg-black/50 border border-white/15 px-4 py-4 text-white"
                />
              </View>

              <View>
                <Text className="text-white text-base mb-2">Health Goals</Text>
                <TextInput
                  value={form.healthGoals}
                  onChangeText={(value) => handleChange("healthGoals", value)}
                  placeholder="e.g. lower blood pressure, improve sleep"
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  maxLength={MAX_HEALTH_GOALS_LENGTH}
                  className="rounded-3xl bg-black/50 border border-white/15 px-4 py-4 text-white min-h-[120px]"
                />
                <Text className="text-white/50 text-xs mt-2 text-right">
                  {form.healthGoals.length}/{MAX_HEALTH_GOALS_LENGTH}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-primaryLight rounded-2xl py-4 mt-2"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {saving ? "Saving..." : "Save Profile"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-500/90 rounded-2xl py-4"
              >
                <Text className="text-white text-lg font-semibold text-center">Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default Settings;
