import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useChoresByRoomQuery } from "@/hooks/choreHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { View, Pressable, TouchableOpacity, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDate } from "../chores";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const RoomChoresScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const router = useRouter();

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-gray-50 dark:bg-black">
        <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-4 mt-5">
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <ThemedText className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Room Chores
              </ThemedText>
            </View>
            
            <TouchableOpacity
              onPress={() => router.push(`/rooms/${roomId}/add`)}
              activeOpacity={0.8}
              style={{
                shadowColor: colors.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 6,
                borderRadius: 20,
              }}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(59, 130, 246, 0.3)",
                }}
              >
                <Ionicons name="add" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View className="mt-2">
            <ThemedText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Room #{roomId}
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Manage and track chores
              </ThemedText>
            </View>
          </View>
        </View>

        <ParallaxScrollViewY>
          <ChoreList roomId={roomId} />
        </ParallaxScrollViewY>
      </View>
    </LoadingAndErrorHandling>
  );
};

export default RoomChoresScreen;

const ChoreList = ({ roomId }: { roomId: string }) => {
  const { data: chores } = useChoresByRoomQuery(roomId);
  const { data: members = [] } = useRoomMembersQuery(roomId);

  const router = useRouter();

  if (!chores.length) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="clipboard-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
          No chores yet
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mt-2 text-sm">
          Add your first chore to get started with room management
        </ThemedText>
      </View>
    );
  }

  const memberMap = new Map(
    (members as unknown as [number, string, number][]).map(([userId, name]) => [
      userId,
      name,
    ])
  );

  return (
    <View className="px-6 pt-6">
      {chores.map((chore) => (
        <Pressable
          key={chore.choreId}
          onPress={() =>
            router.push(`/chore-details/${chore.choreId}?roomId=${roomId}`)
          }
          className="mb-4"
        >
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <ThemedText className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
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
                    <Ionicons name="person-outline" size={12} color="#3b82f6" />
                  </View>
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Assigned to:
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <ThemedText className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {memberMap.get(chore.assignedTo ?? -1) || "Unassigned"}
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View className="absolute top-5 right-5">
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};
