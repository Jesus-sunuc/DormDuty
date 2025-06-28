import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAddChoreMutation, useChoresByRoomQuery } from "@/hooks/choreHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import { View, Pressable, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Card } from "@/components/Card";
import { formatDate } from "../(tabs)/chores";
import { useState } from "react";
import { toastError, toastSuccess } from "@/components/ToastService";
import { ChoreModal } from "@/components/chores/ChoreModal";
import { ChoreCreateRequest } from "@/models/Chore";
import { useAuth } from "@/hooks/user/useAuth";

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
      <ParallaxScrollView>
        <View>
          <Pressable onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#9ca3af" />
          </Pressable>
          <ChoreList roomId={roomId} />
        </View>
      </ParallaxScrollView>
      <TouchableOpacity
        onPress={() => router.push(`/rooms/${roomId}/add`)}
        className="absolute bottom-10 right-6 bg-customGreen-500 p-4 rounded-full"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <ChoreModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddChore}
        isPending={isPending}
      />
    </LoadingAndErrorHandling>
  );
};

export default RoomChoresScreen;

const ChoreList = ({ roomId }: { roomId: string }) => {
  const { data: chores } = useChoresByRoomQuery(roomId);

  if (!chores.length) {
    return (
      <ThemedText className="text-center text-gray-400">
        No chores in this room yet.
      </ThemedText>
    );
  }

  return (
    <>
      {chores.map((chore) => (
        <Card key={chore.choreId}>
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
              {chore.assignedTo?.toString() || "Unassigned"}
            </ThemedText>
          </View>
        </Card>
      ))}
    </>
  );
};
