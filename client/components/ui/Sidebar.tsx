import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useAuth } from "@/hooks/user/useAuth";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");
const SIDEBAR_WIDTH = screenWidth * 0.8; // 80% of screen width

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const { user, users, switchUser } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 flex-row">
        {/* Backdrop */}
        <Pressable
          className="flex-1 bg-black/50"
          onPress={onClose}
          style={{ width: screenWidth - SIDEBAR_WIDTH }}
        />

        {/* Sidebar */}
        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            width: SIDEBAR_WIDTH,
          }}
          className="flex-1 bg-white dark:bg-neutral-900 shadow-2xl"
        >
          <View className="flex-1">
            {/* Header */}
            <View
              className="bg-white dark:bg-neutral-900 px-6 pb-6 shadow-lg border-b border-gray-100 dark:border-neutral-800"
              style={{ paddingTop: (StatusBar.currentHeight || 0) + 48 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Settings
                  </ThemedText>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                      Developer options and preferences
                    </ThemedText>
                  </View>
                </View>
                <Pressable
                  onPress={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center active:bg-gray-200 dark:active:bg-neutral-700"
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </Pressable>
              </View>
            </View>

            {/* Content */}
            <ParallaxScrollViewY>
              <View className="px-6 pt-6">
                <View className="mb-6">
                  <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800">
                    <View className="mb-4">
                      <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                          <Ionicons name="people" size={16} color="#3b82f6" />
                        </View>
                        <ThemedText className="text-base font-semibold text-gray-900 dark:text-white">
                          Switch User
                        </ThemedText>
                      </View>
                      <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                        Select a different user for testing
                      </ThemedText>
                    </View>

                    <View className="space-y-3">
                      {users.map((u) => (
                        <Pressable
                          key={u.userId}
                          onPress={() => {
                            switchUser(u.userId);
                            // Optional: close sidebar after switching user
                            // onClose();
                          }}
                          className={`flex-row items-center justify-between p-4 rounded-xl border ${
                            u.userId === user?.userId
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 active:bg-gray-100 dark:active:bg-neutral-700"
                          }`}
                        >
                          <View className="flex-1">
                            <Text
                              className={`text-base font-medium ${
                                u.userId === user?.userId
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {u.name}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {u.email}
                            </Text>
                          </View>

                          {u.userId === user?.userId && (
                            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center ml-3">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="white"
                              />
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Future settings sections can be added here */}
                <View className="pb-20">
                  {/* Additional settings content can go here */}
                </View>
              </View>
            </ParallaxScrollViewY>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
