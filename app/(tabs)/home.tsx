import { View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useEffect, useState, useRef } from 'react';
import GradientBackground from "../../components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../backend/services/api";
import auth from '@react-native-firebase/auth';
//import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import images from "../../constants/images";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

// ✅ Define the type for messages
type Message = {
  text: string;
  isUser: boolean;
};

const renderInlineMarkdown = (text: string, textStyle: any, boldStyle: any) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`bold-${index}`} style={[textStyle, boldStyle]}>
          {part.slice(2, -2)}
        </Text>
      );
    }

    return (
      <Text key={`plain-${index}`} style={textStyle}>
        {part}
      </Text>
    );
  });
};

const MarkdownMessage = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const lines = text.split("\n");

  return (
    <View>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <View key={`space-${index}`} style={styles.markdownSpacer} />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <Text key={`h3-${index}`} style={[styles.chatText, styles.markdownHeadingSmall]}>
              {trimmed.slice(4)}
            </Text>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <Text key={`h2-${index}`} style={[styles.chatText, styles.markdownHeadingMedium]}>
              {trimmed.slice(3)}
            </Text>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <Text key={`h1-${index}`} style={[styles.chatText, styles.markdownHeadingLarge]}>
              {trimmed.slice(2)}
            </Text>
          );
        }

        if (/^[-*]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*]\s+/, "");

          return (
            <View key={`bullet-${index}`} style={styles.markdownBulletRow}>
              <Text style={[styles.chatText, styles.markdownBulletGlyph]}>•</Text>
              <Text style={[styles.chatText, styles.markdownBulletText]}>
                {renderInlineMarkdown(bulletText, styles.chatText, styles.chatTextBold)}
              </Text>
            </View>
          );
        }

        return (
          <Text
            key={`p-${index}`}
            style={[
              styles.chatText,
              styles.markdownParagraph,
              isUser ? styles.chatTextUser : null,
            ]}
          >
            {renderInlineMarkdown(trimmed, styles.chatText, styles.chatTextBold)}
          </Text>
        );
      })}
    </View>
  );
};

const MessageBubble = ({ msg }: { msg: Message }) => {
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(undefined);

  return (
    <Animated.View
      entering={FadeIn.duration(800)}
      style={[
        styles.chatBubble,
        msg.isUser ? styles.userBubble : styles.assistantBubble,
        msg.isUser && measuredWidth ? { width: measuredWidth } : {},
      ]}
    >
      {msg.isUser ? (
        <Text
          style={styles.chatText}
          onTextLayout={(e) => {
            const lines = e.nativeEvent.lines;
            if (lines.length > 1) {
              const maxLineWidth = Math.max(...lines.map((l) => l.width));
              setMeasuredWidth(Math.ceil(maxLineWidth) + 20); // +20 for left+right padding
            }
          }}
        >
          {msg.text}
        </Text>
      ) : (
        <MarkdownMessage text={msg.text} isUser={msg.isUser} />
      )}
    </Animated.View>
  );
};

const Home = () => {
  const [fullName, setFullName] = useState("Guest");
  const [firstName, setFirstName] = useState("Guest");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const textTranslateX = useSharedValue(-300);
  const textOpacity = useSharedValue(0);
  const mascotTranslateX = useSharedValue(300);
  const mascotOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textTranslateX.value }],
    opacity: textOpacity.value,
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mascotTranslateX.value }],
    opacity: mascotOpacity.value,
  }));

  const contentFadeStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
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

  useEffect(() => {
    if (!isChatting || messages.length === 0) return;

    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages, isChatting]);

  const handleInputChange = (text: string) => {
    setMessageInput(text);
    contentOpacity.value = withTiming(text.length > 0 ? 0 : 1, { duration: 250, easing: Easing.out(Easing.ease) });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const userMessage = { text: messageInput.trim(), isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setIsChatting(true);
    contentOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });

    try {
      const firebaseUID = auth().currentUser?.uid;

      if (!firebaseUID) {
        console.error("❌ No current Firebase user. Please log in again.");
        alert("Session expired. Please log in again.");
        return;
      }


      // ❌ If still missing, alert and return
      if (!firebaseUID) {
        console.error("❌ firebaseUID is missing in AsyncStorage");
        alert("User ID not found. Please log in again.");
        return;
      }

      console.log("🔹 Sending chat message for user:", firebaseUID);

      // ✅ Format the messages properly
      const messagesArray = [{ role: "user", content: messageInput.trim() }];

      const aiResponse = await api.sendChatMessage(firebaseUID, messagesArray);

      const botMessage = { text: aiResponse, isUser: false };
      setMessages((prev) => [...prev, botMessage]);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("❌ Error communicating with chatbot:", error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsChatting(false);
  };

  const handlePrintDebugAuth = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("No user", "No authenticated Firebase user is available.");
        return;
      }

      const token = await user.getIdToken(true);
      console.log("FIREBASE_UID", user.uid);
      console.log("FIREBASE_ID_TOKEN", token);
      Alert.alert("Auth logged", "Firebase UID and ID token were printed to the console.");
    } catch (error) {
      console.error("❌ Failed to print Firebase auth debug info:", error);
      Alert.alert("Error", "Failed to print Firebase auth debug info.");
    }
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
              <Animated.View style={[{ flex: 1 }, contentFadeStyle]}>
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
                    {/* <LinearGradient
                      colors={['rgba(217, 217, 217, 0.20)', 'rgba(217, 217, 217, 0.00)']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={styles.ellipseBackground}
                    /> */}
                    <Image
                      source={images.carebuddyLeftWave}
                      style={styles.carebuddyImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </View>
                <Text style={styles.helpText}>How can I help you?</Text>
              </Animated.View>
            ) : (
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                  <Text style={styles.newChatText}>+ New Chat</Text>
                </TouchableOpacity>

                <ScrollView
                  ref={scrollViewRef}
                  style={styles.chatContainer}
                  contentContainerStyle={styles.chatContentContainer}
                  onContentSizeChange={() => {
                    requestAnimationFrame(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    });
                  }}
                >
                  {messages.map((msg, index) => (
                    <MessageBubble key={index} msg={msg} />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={[styles.fixedMessageInputContainer, isInputFocused && styles.inputContainerFocused]}>
              <TextInput
                style={styles.messageInput}
                placeholder="Message Me"
                placeholderTextColor="#ccc"
                value={messageInput}
                onChangeText={handleInputChange}
                onSubmitEditing={handleSendMessage}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                selectionColor="#65A844"
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
  helpText: { fontSize: 24, fontFamily: 'Poppins-SemiBold', textAlign: 'center', color: "#fff", marginTop: '25%'},
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
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#65A844',
  },
  messageInput: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
  sendButton: { backgroundColor: '#65A844', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  arrowUp: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatContainer: {
    flex: 1,
    marginVertical: 10,
    marginBottom: 130,
  },
  chatContentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
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
  chatTextUser: { color: 'white' },
  chatTextBold: { fontFamily: 'Poppins-SemiBold' },
  markdownParagraph: { lineHeight: 24 },
  markdownHeadingLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 6,
  },
  markdownHeadingMedium: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 6,
  },
  markdownHeadingSmall: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  markdownBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  markdownBulletGlyph: {
    width: 14,
    lineHeight: 24,
  },
  markdownBulletText: {
    flex: 1,
    lineHeight: 24,
  },
  markdownSpacer: {
    height: 8,
  },
  newChatButton: { alignSelf: 'flex-end', padding: 10 },
  newChatText: { color: '#65A844', fontSize: 16, fontWeight: '600' },
});

export default Home;
