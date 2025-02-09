import { View, Text, StyleSheet, Image, TextInput } from "react-native";
import React from "react";
import GradientBackground from "../../components/GradientBackground";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <SafeAreaView>
          {/* Profile Section */}
          <View style={styles.profileContainer}>
            <Image
              source={require("../../assets/images/Home/Ellipse4.png")}
              style={styles.profileImage}
            />
            <View>
              <Text style={styles.welcomeText}>Welcome Back,</Text>
              <Text style={styles.userName}>Vaishag P Biju</Text>
            </View>
          </View>

          {/* Text Wrapped Around Baymax */}
          <View style={styles.textWrapper}>
            <View style={styles.textContainer}>
              <Text style={styles.greetingText}>
                Hi <Text style={styles.boldText}>Vaishag</Text>,
              </Text>
              <Text style={styles.infoText}>
                Your <Text style={styles.link}>Personal Healthcare</Text>{" "}
                Companion is Here!
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>
                  Informed answers, Friendly Conversation
                </Text>{" "}
                and
                <Text style={styles.boldText}> Personalized Assistance</Text> are
                assured by me.
              </Text>
            </View>
            {/* Baymax Image */}
            <Image
              source={require("../../assets/images/baymax/waving.png")}
              style={styles.baymaxImage}
              resizeMode="contain"
            />
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>How can I help you?</Text>

          {/* Message Input */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Message Me"
              placeholderTextColor="#ccc"
            />
            <View style={styles.sendButton}>
              <Text style={styles.arrowUp}>↑</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
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
    fontWeight: "bold",
    color: "#fff",
  },
  textWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 20,
    color: "#fff",
  },
  infoText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "left",
    marginVertical: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  link: {
    color: "#00bfff",
    fontWeight: "bold",
  },
  baymaxImage: {
    width: 250,
    height: 250,
    position: "absolute",
    top: 400,
    right: -10,
  },
  helpText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 25,
    paddingHorizontal: 15,
    width: "100%",
    marginTop: 20,
    position: "absolute",
    bottom: 150,
  },
  messageInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#00bfff",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowUp: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
