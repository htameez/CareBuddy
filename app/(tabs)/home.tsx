import { View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import React, { useEffect, useState } from 'react';
import GradientBackground from "../../components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../backend/services/api";
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Home = () => {
  const [fullName, setFullName] = useState("Guest");
  const [firstName, setFirstName] = useState("Guest");

  // ✅ Fetch User Info from AsyncStorage
  const getUserInfo = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }

      // ✅ Get Firebase Auth Token
      const token = await currentUser.getIdToken(true);
      console.log("Firebase Auth Token:", token); // Copy this token for testing in Postman

      // ✅ Load from AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedData = JSON.parse(storedUser);
        setFullName(parsedData?.name || "Guest");
        setFirstName(parsedData?.name?.split(' ')[0] || "Guest");
      }

      // ✅ Fetch Latest Data from MongoDB
      const mongoUser = await api.getUser(currentUser.uid);
      if (mongoUser) {
        setFullName(mongoUser.name || "Guest");
        setFirstName(mongoUser.name?.split(' ')[0] || "Guest");

        // ✅ Store Latest Data
        await AsyncStorage.setItem('user', JSON.stringify(mongoUser));
      }
    } catch (error) {
      console.error("Error fetching user info from MongoDB:", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          extraScrollHeight={100} // Pushes content up when keyboard appears
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <SafeAreaView>
              {/* Profile Section */}
              <View style={styles.profileContainer}>
                <Image source={require("../../assets/images/Home/Ellipse4.png")} style={styles.profileImage} />
                <View>
                  <Text style={styles.welcomeText}>Welcome Back,</Text>
                  <Text style={styles.userName}>{fullName}</Text>
                </View>
              </View>

              {/* Text Wrapped Around Baymax */}
              <View style={styles.textWrapper}>
                <View style={styles.textContainer}>
                  <Text style={styles.greetingText}>Hi <Text style={styles.boldText}>{firstName}</Text>,</Text>
                  <Text style={styles.infoText}>
                    Your <Text style={styles.link}>Personal Healthcare</Text> Companion is Here!
                    <Text style={styles.boldText}> Informed answers, Friendly Conversation</Text> and
                    <Text style={styles.boldText}> Personalized Assistance</Text> are assured by me.
                  </Text>
                </View>

                {/* ✅ Baymax Image Positioned Above Ellipse Edge */}
                <View style={styles.baymaxContainer}>
                  {/* ✅ Ellipse Background with Linear Gradient */}
                  <LinearGradient
                    colors={['rgba(217, 217, 217, 0.20)', 'rgba(217, 217, 217, 0.00)']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.ellipseBackground}
                  />

                  {/* ✅ Baymax Image */}
                  <Image
                    source={require("../../assets/images/baymax/waving.png")}
                    style={styles.baymaxImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>How can I help you?</Text>

              {/* Message Input */}
              <View style={styles.messageInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Message Me"
                  placeholderTextColor="#ccc"
                  returnKeyType="send"
                />
                <View style={styles.sendButton}>
                  <Text style={styles.arrowUp}>↑</Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flex: 1,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "#fff",
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Semibold',
    color: "#fff",
  },
  textWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: '67%',
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
    top: '10%',
  },
  greetingText: {
    fontSize: 19,
    color: "#fff",
  },
  infoText: {
    fontSize: 19,
    color: "#fff",
    textAlign: "left",
    marginVertical: 5,
    lineHeight: 40,
  },
  boldText: {
    fontWeight: "bold",
  },
  link: {
    color: "#00bfff",
    fontWeight: "bold",
  },
  // ✅ Container for Baymax and Ellipse
  baymaxContainer: {
    position: 'absolute',
    justifyContent: 'flex-end', // Positions Baymax lower on ellipse
    left: '65%',
    top: '5%',
  },

  // ✅ Ellipse Background with Gradient
  ellipseBackground: {
    position: 'absolute',
    width: 390,
    height: 419,
    borderRadius: 195,
    zIndex: -1, // Places the ellipse behind Baymax
  },

  // ✅ Baymax Image (Aligned with Pixel Positioning)
  baymaxImage: {
    width: 250,
    height: 328,
    top: 53,   // Matches screenshot position
    left: '20%',
    bottom: 2,
    transform: [{ scaleX: -1 }],
    marginBottom: 53, // Slightly raised to "stand" on the ellipse
  },
  helpText: {
    fontSize: 24,
    fontFamily: 'Poppins-Semibold',
    textAlign: 'center',
    color: "#fff",
    marginTop: '43%',
    marginBottom: '5%'
  },
  messageInputContainer: {
    bottom: 0,
    width: '100%',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  messageInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  sendButton: {
    backgroundColor: '#65A844',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  arrowUp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
