import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import FHIR from "fhirclient";

const MELDRX_WORKSPACE_URL = process.env.EXPO_PUBLIC_MELDRX_WORKSPACE_URL ?? "";
const MELDRX_CLIENT_ID = process.env.EXPO_PUBLIC_MELDRX_CLIENT_ID ?? "";
const REDIRECT_URL = process.env.EXPO_PUBLIC_REDIRECT_URL ?? "";

export default function ConnectEHR() {
  const router = useRouter();

  // ✅ Ensure environment variables are loaded correctly
  console.log("🛠 MELDRX_WORKSPACE_URL:", MELDRX_WORKSPACE_URL);
  console.log("🛠 MELDRX_CLIENT_ID:", MELDRX_CLIENT_ID);
  console.log("🛠 REDIRECT_URL:", REDIRECT_URL);

  const handleConnect = async () => {
    try {
      if (!MELDRX_WORKSPACE_URL || !MELDRX_CLIENT_ID || !REDIRECT_URL) {
        Alert.alert("Error", "Missing environment variables. Check .env file.");
        return;
      }

      console.log("🔹 Initiating Epic login...");

      // ✅ Construct Epic login URL using FHIR OAuth2
      FHIR.oauth2.authorize({
        clientId: MELDRX_CLIENT_ID,
        scope: "openid fhirUser profile launch/patient user/*.read patient/*.*",
        redirectUri: REDIRECT_URL,
        iss: MELDRX_WORKSPACE_URL, // Base URL of FHIR API
      });
    } catch (error) {
      console.error("Error opening Epic login:", error);
      Alert.alert("Error", "Failed to open Epic login.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Connect Your EHR</Text>
      <Button title="Connect with Epic" onPress={handleConnect} />
    </View>
  );
}