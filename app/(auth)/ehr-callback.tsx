import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FHIR from "fhirclient";
import { api } from "../../backend/services/api"; // API service for MongoDB updates
import GradientBackground from "../../components/GradientBackground";
import { authConfig } from "../../backend/config/authConfig";

const MELDRX_WORKSPACE_URL = process.env.EXPO_PUBLIC_MELDRX_WORKSPACE_URL ?? "";

export default function EhrCallback() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        const processEpicLogin = async () => {
            try {
                console.log("🔹 Starting FHIR Authorization in the web browser...");
                
                console.log(`🛠 MELDRX_WORKSPACE_URL: ${authConfig.workspaceUrl}`);
                console.log(`🛠 MELDRX_CLIENT_ID: ${authConfig.clientId}`);
                console.log(`🛠 REDIRECT_URL: ${authConfig.redirectUrl}`);

                // ✅ Launch FHIR OAuth2
                await FHIR.oauth2.authorize({
                    clientId: authConfig.clientId,
                    scope: authConfig.scope,
                    redirectUri: authConfig.redirectUrl, // Should be http://localhost:8081/ehr-callback
                    iss: authConfig.workspaceUrl,
                });

                console.log("🔹 Processing Epic login callback...");

                // ✅ Retrieve the Epic client instance
                const client = await FHIR.oauth2.ready();

                if (!client) {
                    Alert.alert("Error", "Failed to retrieve Epic client session.");
                    return;
                }

                console.log("✅ FHIR Client loaded:", client);

                // ✅ Store tokens securely
                await AsyncStorage.setItem("ehr_access_token", client.state.tokenResponse?.access_token ?? "");
                await AsyncStorage.setItem("ehr_id_token", client.state.tokenResponse?.id_token ?? "");

                console.log("🔹 Tokens saved successfully!");

                // ✅ Fetch Patient Data
                const headers = { Authorization: `Bearer ${client.state.tokenResponse?.access_token}` };
                const patientResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/Patient`, { headers });
                const patient = patientResponse.data.entry?.[0]?.resource;

                console.log("✅ Patient FHIR Data:", patient);

                const medicalHistory = {
                    conditions: [],
                    medications: [],
                    allergies: [],
                    demographics: {
                        birthDate: patient?.birthDate || "",
                        gender: patient?.gender || "",
                        ethnicity: patient?.extension?.find((ext: { url: string | string[] }) => ext.url.includes("ethnicity"))?.valueString || "",
                    },
                    clinicalNotes: [],
                };

                // ✅ Fetch medical conditions
                const conditionsResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/Condition?patient=${patient?.id}`, { headers });
                medicalHistory.conditions = conditionsResponse.data.entry?.map((c: { resource: { code: { text: any } } }) => c.resource.code.text) || [];

                // ✅ Fetch medications
                const medicationsResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/MedicationRequest?patient=${patient?.id}`, { headers });
                medicalHistory.medications = medicationsResponse.data.entry?.map((m: { resource: { medicationCodeableConcept: { text: any } } }) => m.resource.medicationCodeableConcept?.text) || [];

                // ✅ Fetch allergies
                const allergiesResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/AllergyIntolerance?patient=${patient?.id}`, { headers });
                medicalHistory.allergies = allergiesResponse.data.entry?.map((a: { resource: { code: { text: any } } }) => a.resource.code.text) || [];

                // ✅ Fetch clinical notes (DocumentReference)
                const notesResponse = await axios.get(`${MELDRX_WORKSPACE_URL}/DocumentReference?patient=${patient?.id}`, { headers });
                medicalHistory.clinicalNotes = notesResponse.data.entry?.map((n: { resource: { date: any; text: { div: string } } }) => ({
                    date: n.resource.date,
                    note: n.resource.text?.div?.replace(/<[^>]+>/g, ""), // Remove HTML tags
                })) || [];

                // ✅ Store Patient Data in MongoDB
                const userId = await AsyncStorage.getItem("user_id");
                await api.updateUserEHR(userId, {
                    epicPatientID: patient?.id,
                    medicalHistory,
                    ehrLastSynced: new Date(),
                });

                console.log("✅ MongoDB updated successfully!");

                // ✅ Deep link back to mobile app
                window.location.href = "carebuddy://home";
            } catch (error) {
                console.error("Error processing Epic login:", error);
                Alert.alert("Error", "Failed to fetch EHR data.");
            }
        };

        processEpicLogin();
    }, []);

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg text-white font-pregular">Loading...</Text>
            </View>
        </GradientBackground>
    );
}