import { View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState, useRef } from 'react';
import GradientBackground from "../../components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../backend/services/api";
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import images from "../../constants/images";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// ✅ Define the type for messages
type Message = {
  text: string;
  isUser: boolean;
};

const Home = () => {
  const [fullName, setFullName] = useState("Guest");
  const [firstName, setFirstName] = useState("Guest");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const textTranslateX = useSharedValue(-300);
  const textOpacity = useSharedValue(0);
  const mascotTranslateX = useSharedValue(300);
  const mascotOpacity = useSharedValue(0);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textTranslateX.value }],
    opacity: textOpacity.value,
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mascotTranslateX.value }],
    opacity: mascotOpacity.value,
  }));

  useEffect(() => {
    textTranslateX.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) });
    textOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });

    mascotTranslateX.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) });
    mascotOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
  }, []);

  const getUserInfo = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedData = JSON.parse(storedUser);
        setFullName(parsedData?.name || "Guest");
        setFirstName(parsedData?.name?.split(' ')[0] || "Guest");
      }

      const mongoUser = await api.getUser(currentUser.uid);
      if (mongoUser) {
        setFullName(mongoUser.name || "Guest");
        setFirstName(mongoUser.name?.split(' ')[0] || "Guest");
        await AsyncStorage.setItem('user', JSON.stringify(mongoUser));
      }
    } catch (error) {
      console.error("Error fetching user info from MongoDB:", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setMessages((prev) => [...prev, { text: messageInput.trim(), isUser: true }]);
    setMessageInput("");
    setIsChatting(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatting(false);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            {!isChatting ? (
              <View style={{ flex: 1 }}>
                <View style={styles.profileContainer}>
                  <Image source={require("../../assets/images/Home/Ellipse4.png")} style={styles.profileImage} />
                  <View>
                    <Text style={styles.welcomeText}>Welcome Back,</Text>
                    <Text style={styles.userName}>{fullName}</Text>
                  </View>
                </View>

                <View style={styles.textWrapper}>
                  <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
                    <Text style={styles.greetingText}>
                      Hi <Text style={styles.boldText}>{firstName}</Text>,
                    </Text>
                    <Text style={styles.infoText}>
                      Your <Text style={styles.link}>Personal Healthcare</Text> Companion is Here!
                      <Text style={styles.boldText}> Informed answers, Friendly{"\n"}Conversation</Text> and
                      <Text style={styles.boldText}> Personalized Assistance</Text> are assured by me.
                    </Text>
                  </Animated.View>
                  <Animated.View style={[styles.baymaxContainer, mascotAnimatedStyle]}>
                    <LinearGradient
                      colors={['rgba(217, 217, 217, 0.20)', 'rgba(217, 217, 217, 0.00)']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={styles.ellipseBackground}
                    />
                    <Image
                      source={images.carebuddyLeftWave}
                      style={styles.carebuddyImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </View>
                <Text style={styles.helpText}>How can I help you?</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                  <Text style={styles.newChatText}>+ New Chat</Text>
                </TouchableOpacity>

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.chatContainer}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                  {messages.map((msg, index) => (
                    <Animated.View
                      key={index}
                      entering={FadeIn.duration(800)}
                      style={[
                        styles.chatBubble,
                        msg.isUser ? styles.userBubble : styles.assistantBubble,
                      ]}
                    >
                      <Text style={styles.chatText}>{msg.text}</Text>
                    </Animated.View>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.fixedMessageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Message Me"
                placeholderTextColor="#ccc"
                value={messageInput}
                onChangeText={setMessageInput}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.arrowUp}>↑</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  welcomeText: { fontSize: 18, color: "#fff", fontFamily: 'Inter-Regular' },
  userName: { fontSize: 24, fontFamily: 'Poppins-SemiBold', color: "#fff" },
  textWrapper: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: '67%' },
  textContainer: { flex: 1, paddingRight: 10, top: '10%' },
  greetingText: { fontSize: 19, color: "#fff" },
  infoText: { width: '94%', fontSize: 19, color: "#fff", lineHeight: 40, fontFamily: 'Poppins-Regular' },
  boldText: { fontFamily: 'Poppins-Bold' },
  link: { color: "#00bfff", fontWeight: "bold", fontFamily: 'Poppins-SemiBold' },
  baymaxContainer: { position: 'absolute', left: '65%', top: '0.5%' },
  ellipseBackground: { position: 'absolute', width: 371, height: 400, borderRadius: 195 },
  carebuddyImage: { width: 700, height: 700, right: '25%', bottom: '16%', transform: [{ rotate: '-15deg' }] },
  helpText: { fontSize: 24, fontFamily: 'Poppins-SemiBold', textAlign: 'center', color: "#fff", marginTop: '37%', marginBottom: '5%' },
  fixedMessageInputContainer: {
    position: 'absolute',
    bottom: '13%',
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  messageInput: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
  sendButton: { backgroundColor: '#65A844', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  arrowUp: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatContainer: {
    flex: 1,
    marginVertical: 10,
    marginBottom: 90,
    overflow: 'hidden',
  },
  chatBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '70%',
  },
  userBubble: { backgroundColor: '#00446e', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#1d5b8f', alignSelf: 'flex-start' },
  chatText: { color: 'white', fontSize: 16, fontFamily: 'Inter-Regular' },
  newChatButton: { alignSelf: 'flex-end', padding: 10 },
  newChatText: { color: '#65A844', fontSize: 16, fontWeight: '600' },
});

export default Home;

