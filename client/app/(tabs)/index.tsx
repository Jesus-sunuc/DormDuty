import { ThemedText } from "@/components/ThemedText";
import {
  useAddRoomMutation,
  useDeleteRoomMutation,
  useRoomsByUserQuery,
  useUpdateRoomMutation,
} from "@/hooks/roomHooks";
import { getRoomColor } from "@/utils/colorUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { useState, useEffect } from "react";
import { TouchableOpacity, View, useColorScheme } from "react-native";
import { RoomModal } from "@/components/index/RoomModal";
import { toastError, toastSuccess } from "@/components/ToastService";
import { Room, RoomUpdateRequest } from "@/models/Room";
import { RoomOptionsBottomSheet } from "@/components/index/RoomOptionsBottomSheet";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/user/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { Colors } from "@/constants/Colors";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const RoomList = ({
  rooms,
  onOptionsPress,
}: {
  rooms: Room[];
  onOptionsPress: (room: Room) => void;
}) => {
  const router = useRouter();

  if (!rooms.length) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="home-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
          No apartments yet
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mt-2 text-sm">
          Create your first apartment to start organizing chores
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="px-6 pt-6">
      {rooms.map((room) => (
        <View key={room.roomId} className="mb-4">
          <TouchableOpacity
            onPress={() => router.push(`/rooms/${room.roomId}`)}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: getRoomColor(room.roomId) }}
                className="w-1 h-20"
              />

              <View className="flex-1 p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                      <Ionicons name="home" size={20} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-lg font-bold text-gray-900 dark:text-gray-300 mb-1">
                        {room.name}
                      </ThemedText>
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                          Active apartment
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => onOptionsPress(room)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center ml-3"
                  >
                    <Entypo
                      name="dots-three-vertical"
                      size={16}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const HomeScreen = () => {
  const { data: rooms, isLoading, error } = useRoomsByUserQuery();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [modalVisible, setModalVisible] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [optionsRoom, setOptionsRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { mutate: addRoomMutate, isPending: addRoomIsPending } =
    useAddRoomMutation();
  const { mutate: updateRoomMutate, isPending: updateRoomIsPending } =
    useUpdateRoomMutation();
  const { mutate: deleteRoomMutate } = useDeleteRoomMutation();

  const { user } = useAuth();
  const userId = user?.userId;
  const roomId = roomToDelete?.roomId ?? 0;

  const { data: membershipData } = useMembershipQuery(userId!, roomId, {
    enabled: !!roomToDelete?.roomId && !!userId && showDeleteConfirmation,
  });

  useEffect(() => {
    return () => {
      if (showDeleteConfirmation) {
        setShowDeleteConfirmation(false);
      }
      if (roomToDelete) {
        setRoomToDelete(null);
      }
      if (optionsRoom) {
        setOptionsRoom(null);
      }
    };
  }, []);

  const handleAddRoom = (name: string) => {
    if (userId === undefined) {
      toastError("You must be logged in to create a room.");
      return;
    }

    addRoomMutate(
      { name, createdBy: userId },
      {
        onSuccess: (data) => {
          toastSuccess(
            `Room "${name}" created successfully! You are now the admin.`
          );
          setModalVisible(false);
        },
        onError: (error) => {
          console.error("Failed to create room:", error);
          toastError("Failed to create room");
        },
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
      onError: (error) => {
        console.error("Failed to update room:", error);
        toastError("Failed to update room");
      },
    });
  };

  const handleDeleteRoom = () => {
    if (optionsRoom) {
      setRoomToDelete(optionsRoom);
      setOptionsRoom(null);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete || !membershipData) {
      console.warn("Delete room failed: missing room or membership data", {
        roomToDelete: !!roomToDelete,
        membershipData: !!membershipData,
      });
      toastError("Couldn't confirm your membership");
      setShowDeleteConfirmation(false);
      setRoomToDelete(null);
      return;
    }

    const { membershipId, role } = membershipData;
    deleteRoomMutate(
      {
        roomId: roomToDelete.roomId,
        membershipId: membershipId,
        isAdmin: role === "admin",
      },
      {
        onSuccess: () => {
          toastSuccess(`Room "${roomToDelete.name}" deleted`);
          setShowDeleteConfirmation(false);
          setRoomToDelete(null);
        },
        onError: (error) => {
          console.error("Failed to delete room:", error);
          toastError("Failed to delete room");
          setShowDeleteConfirmation(false);
          setRoomToDelete(null);
        },
      }
    );
  };

  return (
    <LoadingAndErrorHandling>
      {isLoading ? (
        <View className="flex-1 bg-gray-50 dark:bg-black items-center justify-center">
          <ThemedText className="text-gray-500">Loading rooms...</ThemedText>
        </View>
      ) : error ? (
        <View className="flex-1 bg-gray-50 dark:bg-black items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <ThemedText className="text-center text-red-500 mt-4 text-lg font-medium">
            Failed to load rooms
          </ThemedText>
          <ThemedText className="text-center text-gray-500 mt-2 text-sm">
            Please check your connection and try again
          </ThemedText>
        </View>
      ) : (
        <View className="flex-1 bg-gray-50 dark:bg-black">
          <View className="bg-white dark:bg-neutral-900 px-6 pt-12 pb-6 shadow-lg">
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-1">
                <ThemedText className="text-2xl font-bold text-gray-900 dark:text-gray-300 mb-1">
                  Your Apartments
                </ThemedText>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                  <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your living spaces
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setRoomToEdit(null);
                  setModalVisible(true);
                }}
                activeOpacity={0.8}
                style={{
                  shadowColor: colors.shadowColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  borderRadius: 16,
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
                    borderColor: colors.borderAccent,
                  }}
                >
                  <Ionicons name="add" size={22} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <ParallaxScrollViewY>
            <RoomList rooms={rooms || []} onOptionsPress={setOptionsRoom} />
          </ParallaxScrollViewY>

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

          <ConfirmationModal
            visible={showDeleteConfirmation}
            onClose={() => {
              setShowDeleteConfirmation(false);
              setRoomToDelete(null);
            }}
            onConfirm={confirmDeleteRoom}
            title="Delete Room"
            message={`Are you sure you want to delete "${roomToDelete?.name}"? This will permanently remove the room and all its chores. This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            destructive={true}
            icon="home-outline"
          />
        </View>
      )}
    </LoadingAndErrorHandling>
  );
};

export default HomeScreen;
