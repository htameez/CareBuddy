import { View, Text, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const ConnectEHR = () => {
    const router = useRouter();

    const connectEHR = async () => {
        console.log("🔹 Opening EHR authentication popup...");
        const ehrConnectUrl = "http://localhost:8081/connect-ehr";

        const result = await WebBrowser.openAuthSessionAsync(ehrConnectUrl, "localhost:8081/ehr-callback");

        if (result.type === "success" && result.url.includes("localhost:8081/ehr-callback")) {
            console.log("✅ Detected EHR Callback, proceeding...");
            router.replace("/ehr-callback"); // ✅ Handle token exchange
        }
    };

    return (
        <View className="flex-1 justify-center items-center">
            <Text className="font-psemibold text-white text-[36px] mb-6">Connect Your EHR</Text>
            <Button title="Connect Now" onPress={connectEHR} />
        </View>
    );
};

export default ConnectEHR;