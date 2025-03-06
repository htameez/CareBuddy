import { useEffect } from "react";
import { View, Text } from "react-native";
import FHIR from "fhirclient";
import { authConfig } from "../../backend/config/authConfig";
import GradientBackground from "../../components/GradientBackground";

export default function ConnectEHR() {
    useEffect(() => {
        const startEpicAuth = async () => {
            try {
                console.log("🔹 Starting FHIR Authorization in the web browser...");
                console.log(`🛠 MELDRX_WORKSPACE_URL: ${authConfig.workspaceUrl}`);
                console.log(`🛠 MELDRX_CLIENT_ID: ${authConfig.clientId}`);
                console.log(`🛠 REDIRECT_URL: ${authConfig.redirectUrl}`);

                // ✅ Start FHIR OAuth2 Authentication
                await FHIR.oauth2.authorize({
                    clientId: authConfig.clientId,
                    scope: authConfig.scope,
                    redirectUri: authConfig.redirectUrl, // Redirects to ehr-callback
                    iss: authConfig.workspaceUrl,
                });

            } catch (error) {
                console.error("❌ Error launching Epic login:", error);
            }
        };

        startEpicAuth();
    }, []);

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg text-white font-pregular">Redirecting to Epic...</Text>
            </View>
        </GradientBackground>
    );
}

