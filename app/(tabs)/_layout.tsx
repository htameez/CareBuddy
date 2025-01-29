import React from "react";
import { Tabs } from "expo-router";
import GradientBackground from "@/components/GradientBackground";

const TabsLayout = () => {
  return (
    <GradientBackground>
      <Tabs>
        <Tabs.Screen name="home" />
      </Tabs>
    </GradientBackground>
  );
};

export default TabsLayout;