import { Slot, Stack } from 'expo-router';
import GradientBackground from "../components/GradientBackground";

const RootLayout = () => {
  return (
    <GradientBackground>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: "transparent", // Ensures Stack content is transparent
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GradientBackground>
  );
};

export default RootLayout;
