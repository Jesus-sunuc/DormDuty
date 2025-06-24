import { Card } from "@/components/Card";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import {
  useAddRoomMutation,
  useDeleteRoomMutation,
  useRoomsQuery,
  useUpdateRoomMutation,
} from "@/hooks/roomHooks";
import { getRoomColor } from "@/utils/colorUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { RoomModal } from "@/components/index/RoomModal";
import { toastError, toastSuccess } from "@/components/ToastService";
import { Room, RoomUpdateRequest } from "@/models/Room";
import { RoomOptionsBottomSheet } from "@/components/index/RoomOptionsBottomSheet";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { useRouter } from "expo-router";

const RoomList = ({
  rooms,
  onOptionsPress,
}: {
  rooms: Room[];
  onOptionsPress: (room: Room) => void;
}) => {
  const router = useRouter();
  return (
    <>
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
          <TouchableOpacity
            onPress={() => router.push(`/rooms/${room.roomId}`)}
            className="p-3 flex-1"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={22} color="#9ca3af" />
              <ThemedText className="ml-2 text-lg font-semibold dark:text-gray-100">
                {room.name}
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onOptionsPress(room)}
            className="ml-2"
          >
            <Entypo name="dots-three-vertical" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>
      ))}
    </>
  );
};

const HomeScreen = () => {
  const { data: rooms } = useRoomsQuery();

  const [modalVisible, setModalVisible] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [optionsRoom, setOptionsRoom] = useState<Room | null>(null);

  const { mutate: addRoomMutate, isPending: addRoomIsPending } =
    useAddRoomMutation();
  const { mutate: updateRoomMutate, isPending: updateRoomIsPending } =
    useUpdateRoomMutation();
  const { mutate: deleteRoomMutate } = useDeleteRoomMutation();

  const userId = 3;
  const roomId = optionsRoom?.roomId ?? 0;

  const { data: membershipData } = useMembershipQuery(userId, roomId, {
    enabled: !!optionsRoom?.roomId,
  });

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
    updateRoomMutate({ roomId: roomToEdit.roomId, name } as RoomUpdateRequest, {
      onSuccess: () => {
        toastSuccess(`Room updated to "${name}"`);
        setRoomToEdit(null);
        setModalVisible(false);
      },
      onError: () => toastError("Failed to update room"),
    });
  };

  const handleDeleteRoom = () => {
    if (!optionsRoom || !membershipData) {
      toastError("Couldn't confirm your membership");
      return;
    }

    const { membershipId, role } = membershipData;
    deleteRoomMutate(
      {
        roomId: optionsRoom.roomId,
        membershipId: membershipId,
        isAdmin: role === "admin",
      },
      {
        onSuccess: () => {
          toastSuccess(`Room "${optionsRoom.name}" deleted`);
          setOptionsRoom(null);
        },
        onError: () => toastError("Failed to delete room"),
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
          <RoomList rooms={rooms} onOptionsPress={setOptionsRoom} />
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

      <RoomOptionsBottomSheet
        visible={!!optionsRoom}
        onClose={() => setOptionsRoom(null)}
        onEdit={() => {
          if (!optionsRoom) return;
          setRoomToEdit(optionsRoom);
          setModalVisible(true);
        }}
        onShareCode={() =>
          toastSuccess(`Duplicated room "${optionsRoom?.name}"`)
        }
        onDelete={handleDeleteRoom}
      />
    </>
  );
};

export default HomeScreen;
