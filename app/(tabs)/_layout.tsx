import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

interface TabIconProps {
  icon: string;
  color: string;
  focused: boolean;
  library?: "Entypo" | "Ionicons";
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused, library = "Entypo" }) => {
  return (
    <View style={styles.iconWrapper}> 
      {library === "Entypo" ? (
        <Entypo name={icon as keyof typeof Entypo.glyphMap} size={32} color={focused ? "white" : "#B0C4DE"} />
      ) : (
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={29} color={focused ? "white" : "#B0C4DE"} />
      )}
    </View>
  );
};

const TabsLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "white",
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.gradientWrapper}>
            <LinearGradient
              colors={["#1D5B8F", "rgba(29, 91, 143, 0.3)"]} 
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradientBackground}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <TabIcon icon="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <TabIcon icon="chatbubble-ellipses" color={color} focused={focused} library="Ionicons" />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <TabIcon icon="bookmark" color={color} focused={focused} library="Ionicons" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <TabIcon icon="settings" color={color} focused={focused} library="Ionicons" />,
        }}
      />
    </Tabs>
  );
};

// ✅ Ensures the tab bar stays at the **bottom**, is `390x105`, and properly aligned
const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0, // ✅ Keeps it fully at the bottom
    left: 0,
    right: 0,
    height: 105, // ✅ Exact height
    width: 390, // ✅ Exact width
    borderRadius: 50, // ✅ Maintains rounded corners
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    alignItems: "center",
  },
  gradientWrapper: {
    width: 390, // ✅ Matches tabBar width
    height: 105, // ✅ Matches tabBar height
    borderRadius: 50,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 50,
  },
  iconWrapper: {
    marginBottom: -50, // ✅ Moves icons slightly lower but prevents clipping
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TabsLayout;
