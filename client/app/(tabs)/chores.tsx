import { useChoresAssignedToUserQuery } from "@/hooks/choreHooks";
import { View, Pressable } from "react-native";
import { formatDistance } from "date-fns";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getRoomColor } from "@/utils/colorUtils";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { useRouter } from "expo-router";

export default function ChoresScreen() {
  const { data: chores = [] } = useChoresAssignedToUserQuery();
  const router = useRouter();

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4 mt-5">
            <View className="flex-1">
              <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Your Tasks
              </ThemedText>
            </View>
          </View>
          
          <View className="mt-2">
            <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
              My Chores
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Tasks assigned to you
              </ThemedText>
            </View>
          </View>
        </View>
        <ParallaxScrollViewY>
          {chores.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Ionicons name="checkmark-circle-outline" size={64} color="#9ca3af" />
              <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
                No chores assigned yet
              </ThemedText>
              <ThemedText className="text-center text-gray-500 mt-2 text-sm">
                You're all caught up! New chores will appear here when assigned.
              </ThemedText>
            </View>
          ) : (
            <View className="px-6 pt-6">
              {chores.map((chore) => {
                return (
                  <Pressable
                    key={chore.choreId}
                    onPress={() => router.push(`/chore-details/${chore.choreId}`)}
                    className="mb-4"
                  >
                    <View className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden">
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: getRoomColor(chore.roomId) }}
                          className="w-1 h-20"
                        />
                        
                        <View className="flex-1 p-5">
                          <ThemedText className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-300">
                            {chore.name}
                          </ThemedText>
                          
                          <View className="space-y-2">
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <View className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-2">
                                  <Ionicons name="time-outline" size={12} color="#f59e0b" />
                                </View>
                                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                                  Last completed:
                                </ThemedText>
                              </View>
                              <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(chore.lastCompleted)}
                              </ThemedText>
                            </View>
                            
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <View className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-2">
                                  <Ionicons name="alarm-outline" size={12} color="#3b82f6" />
                                </View>
                                <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                                  Due at:
                                </ThemedText>
                              </View>
                              <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {chore.timing || "Not set"}
                                </ThemedText>
                              </View>
                            </View>
                          </View>
                        </View>
                        
                        <View className="absolute top-5 right-5">
                          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ParallaxScrollViewY>
      </View>
    </LoadingAndErrorHandling>
  );
}

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Never";
  return formatDistance(new Date(dateString), new Date(), {
    addSuffix: true,
  });
};
