import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import Ionicons from "@expo/vector-icons/Ionicons";

const ToolsScreen = () => {
  const { openSidebar } = useSidebar();

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <Header title="Tools" onMenuPress={openSidebar} />

        <ParallaxScrollViewY>
          <View className="px-6 pt-6">
            <View className="items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                <Ionicons name="construct" size={40} color="#3b82f6" />
              </View>
              <ThemedText className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tools Coming Soon
              </ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                This section will contain useful tools and utilities for
                managing your dorm.
              </ThemedText>
            </View>
          </View>
        </ParallaxScrollViewY>
      </View>
    </LoadingAndErrorHandling>
  );
};

export default ToolsScreen;
