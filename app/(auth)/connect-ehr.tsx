import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { authorize } from "react-native-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authConfig } from "../../backend/config/authConfig";

const ConnectEHR = () => {
    const router = useRouter();

    const onLaunchClick = async () => {
        try {
            console.log("🔹 Opening Epic login...");
            console.log(`🛠 MELDRX_WORKSPACE_URL: ${authConfig.workspaceUrl}`);
            console.log(`🛠 MELDRX_CLIENT_ID: ${authConfig.clientId}`);
            console.log(`🛠 REDIRECT_URL: ${authConfig.redirectUrl}`);

            // ✅ Ensure the correct format
            const config = {
                issuer: authConfig.workspaceUrl, // ✅ REQUIRED
                clientId: authConfig.clientId,
                redirectUrl: authConfig.redirectUrl,
                scopes: authConfig.scope, // ✅ Array format is correct
                serviceConfiguration: {
                    authorizationEndpoint: `${authConfig.workspaceUrl}/authorize`,
                    tokenEndpoint: `${authConfig.workspaceUrl}/token`,
                    revocationEndpoint: `${authConfig.workspaceUrl}/revoke`,
                },
            };

            const authState = await authorize(config);

            console.log("✅ Successfully authenticated!", authState);
        } catch (error) {
            console.error("❌ Error launching Epic login:", error);
        }
    };

    return (
        <View className="flex-1 justify-center items-center">
            <Text className="text-xl font-bold">Connect Your EHR</Text>
            <Button title="Connect with Epic" onPress={onLaunchClick} />
        </View>
    );
};

export default ConnectEHR;