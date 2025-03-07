import { useEffect } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { api } from "../../backend/services/api";
import GradientBackground from "../../components/GradientBackground";
import { authConfig } from "@/backend/config/authConfig";
import { fetchEHRData } from "@/backend/services/ehrService"; // ✅ Import fetchEHRData

export default function EHRCallback() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        const processEHRLogin = async () => {
            try {
                console.log("🔹 Processing EHR Login...");
        
                // ✅ Extract Authorization Code
                const authCode = Array.isArray(params.code) ? params.code[0] : params.code;
                if (!authCode) throw new Error("❌ Missing authorization code.");
                console.log("✅ Authorization Code:", authCode);
        
                // ✅ Retrieve Code Verifier from AsyncStorage
                const codeVerifier = await AsyncStorage.getItem("code_verifier");
                if (!codeVerifier) throw new Error("❌ Missing code_verifier from storage.");
                console.log("✅ Code Verifier:", codeVerifier);
        
                // ✅ Ensure Scope, Client ID, and Redirect URI are Set
                if (!authConfig.scope) throw new Error("❌ Missing required scope.");
                if (!authConfig.clientId) throw new Error("❌ Missing client ID.");
                if (!authConfig.redirectUrl) throw new Error("❌ Missing redirect URI.");
        
                console.log("✅ Scope:", authConfig.scope);
                console.log("✅ Client ID:", authConfig.clientId);
                console.log("✅ Redirect URI:", authConfig.redirectUrl);
        
                // ✅ Construct Token Exchange Request
                const requestBody = new URLSearchParams();
                requestBody.append("code", authCode);
                requestBody.append("grant_type", "authorization_code");
                requestBody.append("scope", authConfig.scope);
                requestBody.append("code_verifier", codeVerifier);
                requestBody.append("client_id", authConfig.clientId);
                requestBody.append("redirect_uri", authConfig.redirectUrl);
        
                // ✅ Send Request to Token Endpoint
                console.log("🔹 Sending token exchange request...");
                const tokenResponse = await axios.post(
                    "https://app.meldrx.com/connect/token",
                    requestBody,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json",
                        },
                    }
                );
        
                // ✅ Extract and Store Access Token
                const accessToken = tokenResponse.data.access_token;
                if (!accessToken) throw new Error("❌ No access token received.");
                console.log("✅ Access Token Received:", accessToken);
                await AsyncStorage.setItem("ehr_access_token", accessToken);

                // ✅ Store Additional Tokens if Available
                if (tokenResponse.data.refresh_token) {
                    await AsyncStorage.setItem("ehr_refresh_token", tokenResponse.data.refresh_token);
                    console.log("🔹 Refresh Token stored.");
                }
                if (tokenResponse.data.id_token) {
                    await AsyncStorage.setItem("ehr_id_token", tokenResponse.data.id_token);
                    console.log("🔹 ID Token stored.");
                }

                // ✅ Fetch EHR Data
                console.log("🔹 Fetching EHR data...");
                const ehrData = await fetchEHRData();
                if (!ehrData) {
                    throw new Error("❌ Failed to fetch EHR data.");
                }
                console.log("✅ EHR Data Retrieved:", ehrData);

                // ✅ Get User ID from AsyncStorage
                const userId = await AsyncStorage.getItem("user_id");
                if (!userId) {
                    throw new Error("❌ No user ID found.");
                }

                // ✅ Store EHR Data in MongoDB
                console.log("🔹 Storing EHR data in MongoDB...");
                await api.updateUserEHR(userId, {
                    ehr: {
                        epicPatientID: ehrData.patientID,
                        ehrLastSynced: new Date(),
                        medicalHistory: {
                            conditions: ehrData.conditions,
                            medications: ehrData.medications,
                            allergies: ehrData.allergies,
                            demographics: ehrData.demographics,
                            clinicalNotes: ehrData.clinicalNotes,
                        },
                    },
                });

                console.log("✅ MongoDB updated successfully!");

                // ✅ Redirect to Home Page
                console.log("🔹 Redirecting to Home...");
                router.replace("/home");

            } catch (error: any) {
                console.error("❌ Token Request Error:", error.response?.status, error.response?.data);
                Alert.alert("Error", "Failed to retrieve access token.");
            }
        };        

        processEHRLogin();
    }, []);

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-lg text-white font-pregular mt-4">
                    Connecting your health records...
                </Text>
            </View>
        </GradientBackground>
    );
}