import React, { useState } from "react";
import {
  View,
  Pressable,
  Animated,
  useColorScheme,
  Dimensions,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getRoomColor } from "@/utils/colorUtils";
import { Chore } from "@/models/Chore";

const { width: screenWidth } = Dimensions.get("window");
const SWIPE_THRESHOLD = screenWidth * 0.25;
const ACTION_WIDTH = 80;

interface SwipeableChoreCardProps {
  chore: Chore;
  isPendingCompletion: boolean;
  isMarkingDone: boolean;
  onPress: () => void;
  onMarkDone: () => void;
  formatDate: (date: string | undefined) => string;
}

export const SwipeableChoreCard: React.FC<SwipeableChoreCardProps> = ({
  chore,
  isPendingCompletion,
  isMarkingDone,
  onPress,
  onMarkDone,
  formatDate,
}) => {
  const colorScheme = useColorScheme();
  const [translateX] = useState(new Animated.Value(0));
  const [showAction, setShowAction] = useState(false);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (translationX < -SWIPE_THRESHOLD) {
        setShowAction(true);
        Animated.spring(translateX, {
          toValue: -ACTION_WIDTH,
          useNativeDriver: true,
        }).start();
      } else {
        setShowAction(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleMarkDone = () => {
    setShowAction(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    onMarkDone();
  };

  const handleCardPress = () => {
    if (showAction) {
      setShowAction(false);
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      onPress();
    }
  };

  return (
    <View className="mb-3 relative">
      {!isPendingCompletion && (
        <View className="absolute right-0 top-0 bottom-0 justify-center items-center bg-emerald-500 rounded-xl overflow-hidden">
          <Pressable
            onPress={handleMarkDone}
            className="w-20 h-full justify-center items-center"
            disabled={isMarkingDone}
          >
            {isMarkingDone ? (
              <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="white" />
                <ThemedText className="text-white text-xs font-medium mt-1">
                  Done
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>
      )}

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={!isPendingCompletion}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
          }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
        >
          <Pressable onPress={handleCardPress} className="p-4">
            <View className="flex-row items-center mb-3">
              <View
                style={{
                  backgroundColor: getRoomColor(chore.roomId),
                }}
                className="w-2 h-2 rounded-full mr-2"
              />
              <Ionicons
                name="home-outline"
                size={18}
                color={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
                style={{ marginRight: 6 }}
              />
              <ThemedText className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
                {chore.name}
              </ThemedText>
              {isPendingCompletion ? (
                <View className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded">
                  <ThemedText className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    [Pending]
                  </ThemedText>
                </View>
              ) : (chore as any).rejectionInfo ? (
                <View className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded">
                  <ThemedText className="text-xs text-red-600 dark:text-red-400 font-medium">
                    [Rejected]
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <Ionicons name="time" size={16} color="#f59e0b" />
                <ThemedText className="text-sm text-gray-700 dark:text-gray-400 ml-1">
                  Due: {chore.timing || "Not set"}
                </ThemedText>
              </View>
              <View className="flex-row items-center flex-1 justify-end">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <ThemedText className="text-sm text-gray-700 dark:text-gray-400 ml-1">
                  Last: {formatDate(chore.lastCompleted)}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
