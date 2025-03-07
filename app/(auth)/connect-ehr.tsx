import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setupPKCE } from "../../backend/utils/pkceUtils";
import { authConfig } from "../../backend/config/authConfig";
import { Platform } from "react-native";
import GradientBackground from "../../components/GradientBackground";

export default function ConnectEHR() {
    const router = useRouter();

    const startEHRAuth = async () => {
        try {
            console.log("🔹 Starting PKCE OAuth2 Authorization...");

            // ✅ Generate PKCE Code Verifier & Code Challenge
            const { codeVerifier, codeChallenge } = await setupPKCE();
            await AsyncStorage.setItem("code_verifier", codeVerifier);

            // ✅ Construct Authorization URL
            const authUrl = `https://app.meldrx.com/connect/authorize?` +
                `client_id=${encodeURIComponent(authConfig.clientId)}` +
                `&aud=${encodeURIComponent(authConfig.workspaceUrl)}` +
                `&redirect_uri=${encodeURIComponent("http://localhost:8081/ehr-callback")}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent(authConfig.scope)}` +
                `&code_challenge=${encodeURIComponent(codeChallenge)}` +
                `&code_challenge_method=S256`;

            console.log("🔹 Attempting to open URL:", authUrl);

            // ✅ Handle authentication differently based on platform
            if (Platform.OS === 'web') {
                // ✅ For web, directly redirect the current window instead of opening a new one
                window.location.href = authUrl;
                
                // Alternative approach if you prefer to keep the popup:
                /*
                const newWindow = window.open(authUrl, '_blank', 'width=800,height=600');
                
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // Popup was blocked
                    Alert.alert(
                        "Popup Blocked", 
                        "Please allow popups for this site and try again."
                    );
                } else {
                    // Inform user about the popup
                    Alert.alert(
                        "Authentication Window Opened", 
                        "Please complete the authentication in the opened window."
                    );
                    
                    // You'll need to properly handle the callback in your callback page
                    // The callback page should communicate back to the opener window
                }
                */
            } else {
                // ✅ For native, use a different approach
                // This would use native modules like WebBrowser or Linking
                // You'd implement this based on your mobile requirements
                Alert.alert("Not implemented", "Mobile authentication flow not implemented");
            }
        } catch (error : any) {
            console.error("❌ Error launching authentication:", error);
            Alert.alert("Error", "Could not start authentication: " + error.message);
        }
    };

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <Text className="text-2xl text-white font-psemibold mb-6">Connect Your Health Records</Text>
                <Text className="text-lg text-white font-pregular mb-8 text-center px-6">
                    Connect to your Electronic Health Record to allow CareBuddy to provide personalized care.
                </Text>
                
                <TouchableOpacity 
                    onPress={startEHRAuth}
                    className="bg-primaryLight py-3 px-6 rounded-lg"
                >
                    <Text className="text-white font-psemibold text-lg">Connect to MeldRX</Text>
                </TouchableOpacity>
            </View>
        </GradientBackground>
    );
}

