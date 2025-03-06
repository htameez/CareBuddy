import { View, Text, Button, Linking } from "react-native";
import GradientBackground from "../../components/GradientBackground";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const ConnectEHR = () => {
    const router = useRouter();

    useEffect(() => {
        const checkIfUserNeedsEHR = async () => {
            const hasEHRConnected = await AsyncStorage.getItem("ehr_access_token");
            if (!hasEHRConnected) {
                console.log("🔹 Redirecting to Connect EHR page in Safari...");
                const ehrConnectUrl = "http://localhost:8081/connect-ehr";

                // ✅ Open Safari with the Connect EHR page
                Linking.openURL(ehrConnectUrl).catch((err) =>
                    console.error("❌ Error launching Connect EHR page:", err)
                );
            }
        };

        checkIfUserNeedsEHR();
    }, []);

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <Text className="font-psemibold text-white text-[36px] mb-6">Connect Your EHR</Text>
                <Button title="Manually Connect" onPress={() => Linking.openURL("http://localhost:8081/connect-ehr")} />
            </View>
        </GradientBackground>
    );
};

export default ConnectEHR;