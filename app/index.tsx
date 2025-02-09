import { Image, ScrollView, Text, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useEffect } from "react";
import images from "../constants/images";
import ArrowButton from "../components/ArrowButton/ArrowButton"; // Adjust path if needed

const { height, width } = Dimensions.get("window"); // Get screen height & width

const App: React.FC = () => {
  const router = useRouter();

  // Shared values for animations
  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const opacity3 = useSharedValue(0);

  const translateY1 = useSharedValue(20);
  const translateY2 = useSharedValue(20);
  const translateY3 = useSharedValue(20);

  const glowOpacity = useSharedValue(0); // 🌟 Glow starts invisible
  const buttonTranslateX = useSharedValue(width); // ✅ Start button off-screen (right)

  useEffect(() => {
    // Animate each message like a text message appearing
    opacity1.value = withDelay(1000, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
    translateY1.value = withDelay(1000, withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }));

    opacity2.value = withDelay(3000, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
    translateY2.value = withDelay(3000, withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }));

    opacity3.value = withDelay(5000, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
    translateY3.value = withDelay(5000, withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }));

    // 🌟 Glow fades in smoothly
    glowOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) });

    // ✅ Slide-in Button Animation
    buttonTranslateX.value = withDelay(7000, withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }));

  }, []);

  // Animated styles for messages
  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: opacity3.value,
    transform: [{ translateY: translateY3.value }],
  }));

  // 🌟 Animated style for Glow fade-in
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // ✅ Animated style for Button Slide-In
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: buttonTranslateX.value }],
  }));

  return (
    <View className="flex-1 relative">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ height: "100%" }}>
          <View className="w-full flex justify-start items-center h-full relative">
            <Text className="font-psemibold text-white text-3xl pt-10">Welcome to CareBuddy</Text>

            <View className="w-full h-3/5 max-h-[400px] items-end pr-8 pt-16 md:pt-24">
              {/* Animated Messages */}
              <Animated.View style={animatedStyle1}>
                <Image source={images.message1} className="w-72 h-24 mb-4" resizeMode="contain" />
              </Animated.View>

              <Animated.View style={animatedStyle2}>
                <Image source={images.message2} className="w-72 h-24 mb-4" resizeMode="contain" />
              </Animated.View>

              <Animated.View style={animatedStyle3}>
                <Image source={images.message3} className="w-72 h-24" resizeMode="contain" />
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ✅ Glow Positioned Below SafeAreaView with Animated Fade-In */}
      <Animated.View style={[animatedGlow, { height: height * 0.4 }]} className="absolute bottom-0 left-0 right-0">
        <Image
          source={images.glow}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Animated.View>

      {/* ✅ Animated Button Positioned at Bottom Right */}
      <Animated.View style={animatedButtonStyle} className="absolute bottom-40 right-10">
        <ArrowButton text="Get Started" handlePress={() => router.push("/sign-in")} isDisabled={false} />
      </Animated.View>
    </View>
  );
};

export default App;
