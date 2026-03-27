import { View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import auth from "@react-native-firebase/auth";
import { api } from "../../backend/services/api";
import GradientBackground from "../../components/GradientBackground";

export default function ConnectEHR() {
    const router = useRouter();
    const [form, setForm] = useState({
        patientId: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        mrn: "",
    });
    const [loading, setLoading] = useState(false);

    const syncFromRedox = async () => {
        try {
            const firebaseUID = auth().currentUser?.uid;
            if (!firebaseUID) {
                throw new Error("You must be signed in before syncing EHR data.");
            }

            const hasSearchInput =
                form.patientId || (form.firstName && form.lastName && form.birthDate) || form.mrn;

            if (!hasSearchInput) {
                throw new Error("Enter a patient ID or provide first name, last name, and birth date.");
            }

            setLoading(true);

            const result = await api.syncRedoxEHR(firebaseUID, {
                patientId: form.patientId.trim() || undefined,
                firstName: form.firstName.trim() || undefined,
                lastName: form.lastName.trim() || undefined,
                birthDate: form.birthDate.trim() || undefined,
                mrn: form.mrn.trim() || undefined,
            });

            await AsyncStorage.setItem("user", JSON.stringify(result.user));
            await AsyncStorage.setItem("onboardingCompleted", "true");

            Alert.alert("EHR Synced", "Your Epic data was synced from Redox.");
            router.replace("/home");
        } catch (error : any) {
            console.error("❌ Error syncing Redox EHR:", error);
            Alert.alert("Sync failed", error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center px-6">
                <Text className="text-2xl text-white font-psemibold mb-4">Sync Your Epic Records</Text>
                <Text className="text-lg text-white font-pregular mb-8 text-center">
                    CareBuddy uses Redox to retrieve your Epic sandbox records. Enter a sandbox patient ID or match on patient details.
                </Text>

                <View className="w-full gap-y-3">
                    <TextInput
                        value={form.patientId}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, patientId: value }))}
                        placeholder="Epic/Redox Patient ID"
                        placeholderTextColor="#A0AEC0"
                        className="w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                    <TextInput
                        value={form.firstName}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
                        placeholder="First name"
                        placeholderTextColor="#A0AEC0"
                        className="w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                    <TextInput
                        value={form.lastName}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
                        placeholder="Last name"
                        placeholderTextColor="#A0AEC0"
                        className="w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                    <TextInput
                        value={form.birthDate}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, birthDate: value }))}
                        placeholder="Birth date (YYYY-MM-DD)"
                        placeholderTextColor="#A0AEC0"
                        className="w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                    <TextInput
                        value={form.mrn}
                        onChangeText={(value) => setForm((prev) => ({ ...prev, mrn: value }))}
                        placeholder="MRN or identifier (optional)"
                        placeholderTextColor="#A0AEC0"
                        className="w-full rounded-xl bg-white px-4 py-3 text-black"
                    />
                </View>

                <Text className="text-sm text-white/80 mt-4 mb-6 text-center">
                    For the Redox sandbox, patient ID is the fastest path. Demographic matching depends on the destination data you configured.
                </Text>

                <TouchableOpacity
                    onPress={syncFromRedox}
                    disabled={loading}
                    className="bg-primaryLight py-3 px-6 rounded-lg w-full"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-psemibold text-lg text-center">Sync from Redox</Text>
                    )}
                </TouchableOpacity>
            </View>
        </GradientBackground>
    );
}
