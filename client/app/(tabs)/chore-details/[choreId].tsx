import { useLocalSearchParams, useRouter } from "expo-router";
import { useChoreByIdQuery } from "@/hooks/choreHooks";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDate } from "../chores";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";

const ChoreDetailsScreen = () => {
  const { choreId, roomId } = useLocalSearchParams<{ choreId: string; roomId?: string }>();
  const router = useRouter();

  const { data: chore } = useChoreByIdQuery(Number(choreId));

  const handleBack = () => {
    if (roomId) {
      router.push(`/rooms/${roomId}`);
    } else {
      router.back();
    }
  };

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <LoadingAndErrorHandling>
      <ParallaxScrollView>
        <TouchableOpacity onPress={handleBack} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <View className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow mb-6">
          <ThemedText className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {chore.name}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
            Chore Details
          </ThemedText>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="person" size={20} color="#6b7280" />
          <ThemedText className="ml-2 text-base text-gray-700 dark:text-gray-300">
            Assigned To: {chore.assignedTo || "Unassigned"}
          </ThemedText>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="repeat" size={20} color="#6b7280" />
          <ThemedText className="ml-2 text-base text-gray-700 dark:text-gray-300">
            Frequency: {chore.frequency}
          </ThemedText>
        </View>

        {chore.startDate && (
          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar" size={20} color="#6b7280" />
            <ThemedText className="ml-2 text-base text-gray-700 dark:text-gray-300">
              Start Date: {formatDate(chore.startDate)}
            </ThemedText>
          </View>
        )}

        {chore.dayOfWeek !== undefined && chore.dayOfWeek !== null && (
          <View className="flex-row items-center mb-4">
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <ThemedText className="ml-2 text-base text-gray-700 dark:text-gray-300">
              Day of Week: {days[chore.dayOfWeek]}
            </ThemedText>
          </View>
        )}

        {chore.timing && (
          <View className="flex-row items-center mb-4">
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <ThemedText className="ml-2 text-base text-gray-700 dark:text-gray-300">
              Time: {chore.timing}
            </ThemedText>
          </View>
        )}

        {chore.description && (
          <View className="bg-gray-100 dark:bg-neutral-900 rounded-lg p-4 mt-6">
            <ThemedText className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Description
            </ThemedText>
            <ThemedText className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {chore.description}
            </ThemedText>
          </View>
        )}
      </ParallaxScrollView>
    </LoadingAndErrorHandling>
  );
};

export default ChoreDetailsScreen;
