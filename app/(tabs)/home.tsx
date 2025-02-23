import { View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from 'react';
import GradientBackground from "../../components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../backend/services/api";
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

  // ✅ Fetch User Info from AsyncStorage
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
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <SafeAreaView>
              {!isChatting ? (
                <>
                  <View style={styles.profileContainer}>
                    <Image source={require("../../assets/images/Home/Ellipse4.png")} style={styles.profileImage} />
                    <View>
                      <Text style={styles.welcomeText}>Welcome Back,</Text>
                      <Text style={styles.userName}>{fullName}</Text>
                    </View>
                  </View>

                  <View style={styles.textWrapper}>
                    <View style={styles.textContainer}>
                      <Text style={styles.greetingText}>Hi <Text style={styles.boldText}>{firstName}</Text>,</Text>
                      <Text style={styles.infoText}>
                        Your <Text style={styles.link}>Personal Healthcare</Text> Companion is Here!
                        <Text style={styles.boldText}> Informed answers, Friendly Conversation</Text> and
                        <Text style={styles.boldText}> Personalized Assistance</Text> are assured by me.
                      </Text>
                    </View>
                    <View style={styles.baymaxContainer}>
                      <LinearGradient
                        colors={['rgba(217, 217, 217, 0.20)', 'rgba(217, 217, 217, 0.00)']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={styles.ellipseBackground}
                      />
                      <Image
                        source={require("../../assets/images/baymax/waving.png")}
                        style={styles.baymaxImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  <Text style={styles.helpText}>How can I help you?</Text>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
                    <Text style={styles.newChatText}>+ New Chat</Text>
                  </TouchableOpacity>

                  <ScrollView style={styles.chatContainer}>
                    {messages.map((msg, index) => (
                      <View
                        key={index}
                        style={[styles.chatBubble, msg.isUser ? styles.userBubble : styles.assistantBubble]}
                      >
                        <Text style={styles.chatText}>{msg.text}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}

              <View style={styles.messageInputContainer}>
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
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  profileContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  welcomeText: { fontSize: 18, color: "#fff" },
  userName: { fontSize: 24, fontFamily: 'Poppins-SemiBold', color: "#fff", },
  textWrapper: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: '67%' },
  textContainer: { flex: 1, paddingRight: 10 },
  greetingText: { fontSize: 19, color: "#fff" },
  infoText: { fontSize: 19, color: "#fff", lineHeight: 40 },
  boldText: { fontWeight: "bold" },
  link: { color: "#00bfff", fontWeight: "bold" },
  baymaxContainer: { position: 'absolute', left: '65%', top: '5%' },
  ellipseBackground: { position: 'absolute', width: 390, height: 419, borderRadius: 195 },
  baymaxImage: { width: 250, height: 328, top: 53, left: '20%', transform: [{ scaleX: -1 }] },
  helpText: { fontSize: 24, fontFamily: 'Poppins-SemiBold', textAlign: 'center', color: "#fff", marginTop: '43%', marginBottom: '5%' },
  messageInputContainer: { bottom: 0, width: '100%', height: '10%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, },
  messageInput: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Poppins-Medium', },
  sendButton: { backgroundColor: '#65A844', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  arrowUp: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  chatContainer: { flex: 1, marginVertical: 20 },
  chatBubble: { padding: 10, borderRadius: 20, marginVertical: 5, maxWidth: '70%' },
  userBubble: { backgroundColor: '#00446e', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#1d5b8f', alignSelf: 'flex-start' },
  chatText: { color: 'white', fontSize: 14 },
  newChatButton: { alignSelf: 'flex-end', padding: 10 },
  newChatText: { color: '#65A844', fontSize: 16, fontWeight: '600' },
});

export default Home;
