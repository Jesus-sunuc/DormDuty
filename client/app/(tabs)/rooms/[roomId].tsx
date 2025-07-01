import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAddChoreMutation, useChoresByRoomQuery } from "@/hooks/choreHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { View, Pressable, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Card } from "@/components/Card";
import { formatDate } from "../chores";
import { useState } from "react";
import { toastError, toastSuccess } from "@/components/ToastService";
import { ChoreModal } from "@/components/chores/ChoreModal";
import { ChoreCreateRequest } from "@/models/Chore";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomMembersQuery } from "@/hooks/membershipHooks";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";

const RoomChoresScreen = () => {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const router = useRouter();
  const { user } = useAuth();

  const [isModalVisible, setModalVisible] = useState(false);
  const { mutate: addChore, isPending } = useAddChoreMutation();

  const handleAddChore = (chore: Partial<ChoreCreateRequest>) => {
    if (!roomId || !chore.name) return;

    addChore(
      {
        roomId: parseInt(roomId),
        name: chore.name,
        frequency: chore.frequency ?? "One Time",
        frequencyValue: chore.frequencyValue,
        dayOfWeek: chore.dayOfWeek,
        timing: chore.timing,
        description: chore.description,
        startDate: chore.startDate,
        assignedTo: user?.userId ?? 0,
        isActive: chore.isActive ?? true,
      },
      {
        onSuccess: () => {
          toastSuccess("Chore added!");
          setModalVisible(false);
        },
        onError: () => toastError("Failed to add chore"),
      }
    );
  };

  return (
    <LoadingAndErrorHandling>
      <View className="flex-1 bg-white dark:bg-black">
        <View className="flex-row justify-between items-center px-6 mt-14 py-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-black z-10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#9ca3af" />
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold text-gray-800 dark:text-white">
            Room Chores
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push(`/rooms/${roomId}/add`)}
            className="bg-customGreen-500 p-2 rounded-full"
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ParallaxScrollViewY >
          <ChoreList roomId={roomId} />
        </ParallaxScrollViewY>

        <ChoreModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddChore}
          isPending={isPending}
        />
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
      <ThemedText className="text-center text-gray-400">
        No chores in this room yet.
      </ThemedText>
    );
  }

  const memberMap = new Map(
    (members as unknown as [number, string, number][]).map(([userId, name]) => [
      userId,
      name,
    ])
  );

  return (
    <>
      {chores.map((chore) => (
        <Pressable
          key={chore.choreId}
          onPress={() => router.push(`/chore-details/${chore.choreId}`)}
        >
          <Card>
            <ThemedText className="text-lg font-semibold mb-2 font-grotesk dark:text-gray-100">
              {chore.name}
            </ThemedText>
            <View className="flex-row justify-between mb-1">
              <View className="flex-row items-center space-x-1">
                <Ionicons name="time-outline" size={16} color="#9ca3af" />
                <ThemedText className="text-sm text-muted dark:text-gray-300 ms-1">
                  Last completed:
                </ThemedText>
              </View>
              <ThemedText className="text-sm font-medium dark:text-gray-100">
                {formatDate(chore.lastCompleted)}
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row items-center space-x-1">
                <Ionicons name="person-outline" size={16} color="#9ca3af" />
                <ThemedText className="text-sm text-muted dark:text-gray-300 ms-1">
                  Assigned to:
                </ThemedText>
              </View>
              <ThemedText className="text-sm font-medium dark:text-gray-100">
                {memberMap.get(chore.assignedTo ?? -1) || "Unassigned"}
              </ThemedText>
            </View>
          </Card>
        </Pressable>
      ))}
    </>
  );
};
