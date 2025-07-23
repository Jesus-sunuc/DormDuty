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
  Platform,
  Linking,
  Alert,
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

// FAQ data for DormDuty app
const FAQ_DATA = [
  {
    question: "How do I join a room?",
    answer:
      "To join a room, tap the 'Join Room' button on the home page, then enter the room code provided by your dormmate or room administrator.",
  },
  {
    question: "How do I create chores and assign them?",
    answer:
      "Go to the Chores tab, tap the '+' button to create a new chore. You can set the title, description, due date, and assign it to specific roommates.",
  },
  {
    question: "How do I track shared expenses?",
    answer:
      "Use the Expenses tab to add new expenses. Enter the amount, description, and select which roommates should split the cost. The app will automatically calculate each person's share.",
  },
  {
    question: "How do I swap chores with roommates?",
    answer:
      "In your chores list, tap on a chore and select 'Request Swap'. Choose the roommate you want to swap with and they'll receive a notification to approve or decline.",
  },
  {
    question: "How do cleaning checklists work?",
    answer:
      "Cleaning checklists help ensure all tasks are completed. Create a checklist with specific cleaning tasks, assign it to roommates, and track completion status.",
  },
  {
    question: "Can I get notifications for chores and expenses?",
    answer:
      "Yes! Enable push notifications in your device settings. You'll receive reminders for upcoming chores, expense requests, and room announcements.",
  },
  {
    question: "How do I leave a room?",
    answer:
      "Go to the Rooms tab, select your room, and tap 'Leave Room'. Note that you'll lose access to all room data including chores and expenses.",
  },
  {
    question: "What if I forgot to mark a chore as complete?",
    answer:
      "You can mark chores as complete anytime by tapping on the chore and selecting 'Mark Complete'. Late completions will be tracked for reference.",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose }) => {
  const { user, logout } = useFirebaseAuth();
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const [currentView, setCurrentView] = React.useState<
    "main" | "faq" | "contact"
  >("main");
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleClose = () => {
    setCurrentView("main");
    setExpandedFAQ(null);
    onClose();
  };

  const handleCallSupport = () => {
    Linking.openURL("tel:4353146355");
  };

  const handleEmailSupport = () => {
    Linking.openURL(
      "mailto:ms.jesustuyuc@gmail.com?subject=DormDuty Support Request"
    );
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
      onRequestClose={handleClose}
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
          <Pressable className="flex-1 bg-black/60" onPress={handleClose} />
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
              className="bg-white dark:bg-neutral-900 px-6 pb-4 border-b border-gray-100 dark:border-neutral-800"
              style={{
                paddingTop:
                  Platform.OS === "android"
                    ? (StatusBar.currentHeight || 0) + 16
                    : 60,
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1 flex-row items-center">
                  {currentView !== "main" && (
                    <Pressable
                      onPress={() => setCurrentView("main")}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center active:bg-gray-200 dark:active:bg-neutral-700 mr-3"
                    >
                      <Ionicons name="arrow-back" size={20} color="#6b7280" />
                    </Pressable>
                  )}
                  <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentView === "main"
                      ? "Settings"
                      : currentView === "faq"
                        ? "Help & FAQ"
                        : "Contact Support"}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={handleClose}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center active:bg-gray-200 dark:active:bg-neutral-700"
                >
                  <Ionicons name="close" size={20} color="#6b7280" />
                </Pressable>
              </View>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                  {currentView === "main"
                    ? "Manage your account and preferences"
                    : currentView === "faq"
                      ? "Find answers to common questions"
                      : "Get in touch with our support team"}
                </ThemedText>
              </View>
            </View>

            <View className="flex-1 bg-gray-50 dark:bg-black">
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                {currentView === "main" && (
                  <View className="px-6 py-6">
                    <View className="mb-6">
                      <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <View className="flex-row items-center mb-4">
                          <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-4">
                            <Text className="text-white font-bold text-lg">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user?.name || "User"}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              {user?.email || "No email"}
                            </Text>
                          </View>
                        </View>

                       
                      </View>
                    </View>

                    {/* <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-1">
                        App Settings
                      </Text>
                      <View className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <Pressable className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800 active:bg-gray-50 dark:active:bg-neutral-800">
                          <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                            <Ionicons
                              name="notifications"
                              size={16}
                              color="#22c55e"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Notifications
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Manage your notification preferences
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>

                        <Pressable className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800 active:bg-gray-50 dark:active:bg-neutral-800">
                          <View className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
                            <Ionicons
                              name="settings"
                              size={16}
                              color="#8b5cf6"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Preferences
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Customize your app experience
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>

                        <Pressable className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-neutral-800">
                          <View className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-3">
                            <Ionicons
                              name="shield-checkmark"
                              size={16}
                              color="#f97316"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Privacy & Security
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Control your data and privacy
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>
                      </View>
                    </View> */}

                    <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-1">
                        Support
                      </Text>
                      <View className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <Pressable
                          onPress={() => setCurrentView("faq")}
                          className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800 active:bg-gray-50 dark:active:bg-neutral-800"
                        >
                          <View className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 items-center justify-center mr-3">
                            <Ionicons
                              name="help-circle"
                              size={16}
                              color="#06b6d4"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Help & FAQ
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Get answers to common questions
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => setCurrentView("contact")}
                          className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-neutral-800"
                        >
                          <View className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 items-center justify-center mr-3">
                            <Ionicons name="mail" size={16} color="#eab308" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Contact Support
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              Get help from our support team
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>
                      </View>
                    </View>

                    <View className="mb-6">
                      <Pressable
                        onPress={handleLogout}
                        className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-red-200 dark:border-red-800 shadow-sm active:bg-red-50 dark:active:bg-red-900/10"
                      >
                        <View className="flex-row items-center justify-center">
                          <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mr-3">
                            <Ionicons
                              name="log-out-outline"
                              size={16}
                              color="#ef4444"
                            />
                          </View>
                          <Text className="text-base font-semibold text-red-600 dark:text-red-400">
                            Sign Out
                          </Text>
                        </View>
                      </Pressable>
                    </View>

                    <View className="items-center py-4">
                      <Text className="text-xs text-gray-400 dark:text-gray-600 mb-1">
                        DormDuty v1.1.1
                      </Text>
                    </View>
                  </View>
                )}

                {currentView === "faq" && (
                  <View className="px-6 py-6">
                    <View className="mb-4">
                      <Text className="text-base text-gray-600 dark:text-gray-400 leading-6">
                        Here are answers to the most frequently asked questions
                        about using DormDuty.
                      </Text>
                    </View>

                    {FAQ_DATA.map((faq, index) => (
                      <View key={index} className="mb-4">
                        <View className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                          <Pressable
                            onPress={() =>
                              setExpandedFAQ(
                                expandedFAQ === index ? null : index
                              )
                            }
                            className="p-4 active:bg-gray-50 dark:active:bg-neutral-800"
                          >
                            <View className="flex-row items-center justify-between">
                              <Text className="text-base font-medium text-gray-900 dark:text-white flex-1 pr-3">
                                {faq.question}
                              </Text>
                              <Ionicons
                                name={
                                  expandedFAQ === index
                                    ? "chevron-up"
                                    : "chevron-down"
                                }
                                size={20}
                                color="#9ca3af"
                              />
                            </View>
                          </Pressable>

                          {expandedFAQ === index && (
                            <View className="px-4 pb-4 border-t border-gray-100 dark:border-neutral-800">
                              <Text className="text-sm text-gray-600 dark:text-gray-400 leading-6 mt-3">
                                {faq.answer}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {currentView === "contact" && (
                  <View className="px-6 py-6">
                    <View className="mb-6">
                      <Text className="text-base text-gray-600 dark:text-gray-400 leading-6">
                        Need help with DormDuty? Our support team is here to
                        assist you. Choose your preferred contact method below.
                      </Text>
                    </View>

                    <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-1">
                        Contact Methods
                      </Text>
                      <View className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <Pressable
                          onPress={handleCallSupport}
                          className="flex-row items-center p-4 border-b border-gray-100 dark:border-neutral-800 active:bg-gray-50 dark:active:bg-neutral-800"
                        >
                          <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
                            <Ionicons name="call" size={20} color="#22c55e" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Call Support
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              (435) 314-6355
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Available Monday-Friday, 9 AM - 5 PM MST
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>

                        <Pressable
                          onPress={handleEmailSupport}
                          className="flex-row items-center p-4 active:bg-gray-50 dark:active:bg-neutral-800"
                        >
                          <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                            <Ionicons name="mail" size={20} color="#3b82f6" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                              Email Support
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                              ms.jesustuyuc@gmail.com
                            </Text>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              We'll respond within 24 hours
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#9ca3af"
                          />
                        </Pressable>
                      </View>
                    </View>

                    <View className="mb-6">
                      <View className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
                        <View className="flex-row items-start">
                          <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 items-center justify-center mr-3 mt-0.5">
                            <Ionicons
                              name="information-circle"
                              size={16}
                              color="#f59e0b"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                              Before contacting support
                            </Text>
                            <Text className="text-sm text-amber-700 dark:text-amber-300 leading-5">
                              Please check our FAQ section first - many common
                              questions are answered there! For technical
                              issues, please include your device type and app
                              version.
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
