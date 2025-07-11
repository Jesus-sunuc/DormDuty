import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import clsx from "clsx";
import { LayoutWithSidebar } from "@/components/ui/LayoutWithSidebar";
import { TabBarIconWithBadge } from "@/components/ui/TabBarIconWithBadge";
import { useChoreCount } from "@/hooks/useChoreCount";

const TabLayout = () => {
  const rawColorScheme = useColorScheme();
  const colorScheme = rawColorScheme === "dark" ? "dark" : "light";
  const choreCount = useChoreCount();

  return (
    <LayoutWithSidebar>
      <View className={clsx(colorScheme === "dark" && "dark", "flex-1")}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            tabBarInactiveTintColor:
              Colors[colorScheme ?? "light"].tabIconDefault,
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
            name="updates"
            options={{
              title: "Updates",
              tabBarIcon: ({ color, focused }) => (
                <AntDesign name="notification" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chores"
            options={{
              title: "Chores",
              tabBarIcon: ({ color, focused }) => (
                <TabBarIconWithBadge
                  name={
                    focused ? "checkmark-circle" : "checkmark-circle-outline"
                  }
                  focused={focused}
                  color={color}
                  size={24}
                  badgeCount={choreCount}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="tools"
            options={{
              title: "Tools",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "construct" : "construct-outline"}
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
          <Tabs.Screen
            name="expenses-details/add"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="expenses-details/[expenseId]"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="announcement-details/[announcementId]"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </LayoutWithSidebar>
  );
};

export default TabLayout;
