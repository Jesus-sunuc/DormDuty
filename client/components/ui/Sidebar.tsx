import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(screenWidth * 0.85, 350);

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const { user, logout } = useFirebaseAuth();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, opacityAnim]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        <Animated.View
          style={{
            opacity: opacityAnim,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Pressable className="flex-1 bg-black/60" onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_WIDTH,
            transform: [{ translateX: slideAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 16,
            zIndex: 1000,
          }}
          className="bg-white dark:bg-neutral-900"
        >
          <View className="flex-1">
            <View
              className="bg-white dark:bg-neutral-900 px-6 pb-6 border-b border-gray-100 dark:border-neutral-800"
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

            <View className="flex-1 bg-gray-100 dark:bg-black">
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <View className="px-6 pt-6">
                  <View className="mb-6">
                    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800">
                      <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                          <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                            <Ionicons name="person" size={16} color="#3b82f6" />
                          </View>
                          <ThemedText className="text-base font-semibold text-gray-900 dark:text-white">
                            User Profile
                          </ThemedText>
                        </View>
                        <ThemedText className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                          Your account information
                        </ThemedText>
                      </View>

                      {user && (
                        <View className="space-y-4">
                          <View className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
                            <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {user.email}
                            </Text>
                          </View>

                          <Pressable
                            onPress={handleLogout}
                            className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 active:bg-red-100 dark:active:bg-red-900/30"
                          >
                            <Ionicons
                              name="log-out-outline"
                              size={16}
                              color="#ef4444"
                            />
                            <Text className="text-base font-medium text-red-600 dark:text-red-400 ml-2">
                              Logout
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
