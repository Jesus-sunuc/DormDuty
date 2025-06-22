import { Card } from "@/components/Card";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import {
  useAddRoomMutation,
  useRoomsQuery,
  useUpdateRoomMutation,
} from "@/hooks/roomHooks";
import { getRoomColor } from "@/utils/colorUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { RoomModal } from "@/components/index/RoomModal";
import { toastError, toastSuccess } from "@/components/ToastService";
import { Room, RoomUpdateRequest } from "@/models/Room";

export default function HomeScreen() {
  const { data: rooms } = useRoomsQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  const userId = 3; // Replace with auth-based value

  const { mutate: addRoomMutate, isPending: addRoomIsPending } = useAddRoomMutation();
  const { mutate: updateRoomMutate, isPending: updateRoomIsPending } = useUpdateRoomMutation();

  const handleAddRoom = (name: string) => {
    addRoomMutate(
      { name, createdBy: userId },
      {
        onSuccess: () => {
          toastSuccess(`Room "${name}" created successfully`);
          setModalVisible(false);
        },
        onError: () => toastError("Failed to create room"),
      }
    );
  };

  const handleUpdateRoom = (name: string) => {
    if (!roomToEdit) return;
    updateRoomMutate(
      { roomId: roomToEdit.roomId, name } as RoomUpdateRequest,
      {
        onSuccess: () => {
          toastSuccess(`Room updated to "${name}"`);
          setRoomToEdit(null);
          setModalVisible(false);
        },
      //   onError: (error) => {
      //   console.error("Failed to update room:", error);
      // }
        onError: () => toastError("Failed to update room"),
      }
    );
  };

  return (
    <>
      <ParallaxScrollView>
        <View>
          <ThemedText
            type="title"
            className="text-2xl font-grotesk mb-4 dark:text-gray-200"
          >
            Your Rooms
          </ThemedText>

          {rooms.map((room) => (
            <Card key={room.roomId} className="flex-row items-center pe-2 ps-2">
              <View
                style={{
                  backgroundColor: getRoomColor(room.roomId),
                  width: 6,
                  height: "100%",
                }}
                className="rounded-l-xl"
              />
              <View className="p-3 flex-1">
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={22} color="#9ca3af" />
                  <ThemedText className="ml-2 text-lg font-semibold dark:text-gray-100">
                    {room.name}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => {
                      setRoomToEdit(room);
                      setModalVisible(true);
                    }}
                    className="ml-auto -mt-8"
                  >
                    <Entypo name="dots-three-horizontal" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ParallaxScrollView>

      <TouchableOpacity
        onPress={() => {
          setRoomToEdit(null);
          setModalVisible(true);
        }}
        className="absolute bottom-6 right-6 bg-customGreen-500 p-4 rounded-full"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <RoomModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setRoomToEdit(null);
        }}
        onSubmit={roomToEdit ? handleUpdateRoom : handleAddRoom}
        defaultName={roomToEdit?.name ?? ""}
        submitLabel={roomToEdit ? "Update" : "Create"}
        isPending={roomToEdit ? updateRoomIsPending : addRoomIsPending}
      />
    </>
  );
}