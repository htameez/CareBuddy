import { View, Text, Button, Linking } from "react-native";
import GradientBackground from "../../components/GradientBackground";

const ConnectEHR = () => {
    const onLaunchClick = () => {
        console.log("🔹 Opening EHR processing page in Safari...");
        const ehrCallbackUrl = "http://localhost:8081/ehr-callback"; // ✅ Open localhost on web

        // ✅ Open Safari with the EHR processing page
        Linking.openURL(ehrCallbackUrl).catch((err) =>
            console.error("❌ Error launching EHR callback page:", err)
        );
    };

    return (
        <GradientBackground>
            <View className="flex-1 justify-center items-center">
                <Text className="font-psemibold text-white text-[36px] mb-6">Connect Your EHR</Text>
                <Button title="Connect with Epic" onPress={onLaunchClick} />
            </View>
        </GradientBackground>
    );
};

export default ConnectEHR;
