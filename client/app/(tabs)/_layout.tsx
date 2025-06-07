import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: "Chores",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="tasks" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({color}) => (
            <Ionicons name="gift-outline" size={28} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({color}) => (
            <Ionicons name="wallet-outline" size={28} color={color} />
          )
        }}
      />
      <Tabs.Screen 
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({color}) => (
            <Ionicons name="settings-outline" size={28} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
