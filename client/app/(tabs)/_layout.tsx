import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";

const TabLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <View className={clsx(colorScheme === "dark" && "dark", "flex-1")}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
          headerShown: false,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: colorScheme === "dark" ? "#171717" : "#ffffff",
              borderTopWidth: 1,
              borderTopColor: colorScheme === "dark" ? "#404040" : "#e5e7eb",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              height: 85,
              paddingBottom: 20,
              paddingTop: 8,
            },
            default: {
              backgroundColor: colorScheme === "dark" ? "#171717" : "#ffffff",
              borderTopWidth: 1,
              borderTopColor: colorScheme === "dark" ? "#404040" : "#e5e7eb",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              height: 65,
              paddingBottom: 8,
              paddingTop: 4,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "Expenses",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "wallet" : "wallet-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chores"
          options={{
            title: "Chores",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: "Rewards",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "gift" : "gift-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "settings" : "settings-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="chore-details"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabLayout;
