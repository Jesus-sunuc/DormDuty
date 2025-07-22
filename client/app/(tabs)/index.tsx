import { ThemedText } from "@/components/ThemedText";
import {
  useAddRoomMutation,
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
import {
  useMembershipQuery,
  useLeaveRoomMutation,
} from "@/hooks/membershipHooks";
import { useRouter } from "expo-router";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import { Colors } from "@/constants/Colors";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { JoinRoomModal } from "@/components/index/JoinRoomModal";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";

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
        <Ionicons name="home-outline" size={64} color="#6b7280" />
        <ThemedText className="text-center text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">
          No apartments yet
        </ThemedText>
        <ThemedText className="text-center text-gray-700 dark:text-gray-500 mt-2 text-sm">
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
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden"
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
                    <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-700/30 items-center justify-center mr-3">
                      <Ionicons name="home" size={20} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-1">
                        {room.name}
                      </ThemedText>
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <ThemedText className="text-sm text-gray-700 dark:text-gray-400">
                          Active apartment
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => onOptionsPress(room)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-800 items-center justify-center ml-3"
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
  const { user } = useFirebaseAuth();
  const { openSidebar } = useSidebar();
  const router = useRouter();
  const { data: rooms, isLoading, error } = useRoomsByUserQuery();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const shouldShowLoading = !user || isLoading;

  const [modalVisible, setModalVisible] = useState(false);
  const [joinRoomModalVisible, setJoinRoomModalVisible] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [optionsRoom, setOptionsRoom] = useState<Room | null>(null);
  const [roomToLeave, setRoomToLeave] = useState<Room | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const { mutate: addRoomMutate, isPending: addRoomIsPending } =
    useAddRoomMutation();
  const { mutate: updateRoomMutate, isPending: updateRoomIsPending } =
    useUpdateRoomMutation();
  const { mutate: leaveRoomMutate } = useLeaveRoomMutation();

  const userId = user?.userId;
  const roomId = roomToLeave?.roomId ?? 0;

  const { data: membershipData } = useMembershipQuery(userId!, roomId, {
    enabled: !!roomToLeave?.roomId && !!userId && showLeaveConfirmation,
  });

  useEffect(() => {
    return () => {
      if (showLeaveConfirmation) {
        setShowLeaveConfirmation(false);
      }
      if (roomToLeave) {
        setRoomToLeave(null);
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
        toastError("Failed to update room");
      },
    });
  };

  const handleLeaveRoom = () => {
    if (optionsRoom) {
      setRoomToLeave(optionsRoom);
      setOptionsRoom(null);
      setShowLeaveConfirmation(true);
    }
  };

  const confirmLeaveRoom = () => {
    if (!roomToLeave || !membershipData) {
      console.warn("Leave room failed: missing room or membership data", {
        roomToLeave: !!roomToLeave,
        membershipData: !!membershipData,
      });
      toastError("Couldn't confirm your membership");
      setShowLeaveConfirmation(false);
      setRoomToLeave(null);
      return;
    }

    const { membershipId } = membershipData;
    leaveRoomMutate(
      {
        roomId: roomToLeave.roomId,
        membershipId: membershipId,
      },
      {
        onSuccess: (data) => {
          if (data.roomDeleted) {
            toastSuccess(
              `Left room "${roomToLeave.name}" - Room was deleted as you were the last member`
            );
          } else {
            toastSuccess(`Left room "${roomToLeave.name}" successfully`);
          }
          setShowLeaveConfirmation(false);
          setRoomToLeave(null);
        },
        onError: (error: any) => {
          toastError("Failed to leave room");
          setShowLeaveConfirmation(false);
          setRoomToLeave(null);
        },
      }
    );
  };

  const handleJoinRoomSuccess = (roomId: number) => {
    router.push(`/(tabs)/rooms/${roomId}`);
  };

  return (
    <LoadingAndErrorHandling
      isLoading={shouldShowLoading}
      error={error}
      loadingText="Loading apartments..."
    >
      <View className="flex-1 bg-gray-100 dark:bg-black">
        <Header
          title="Your Rooms"
          onMenuPress={openSidebar}
          rightComponent={
            <View className="flex-row space-x-3 gap-2">
              <TouchableOpacity
                onPress={() => setJoinRoomModalVisible(true)}
                activeOpacity={0.7}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                className="bg-blue-100 dark:bg-blue-600 border-blue-200 dark:border-blue-700 px-2 py-2 rounded-xl border  flex-row items-center"
              >
                <Ionicons
                  name="enter-outline"
                  size={17}
                  color={colorScheme === "dark" ? "#e0e7ff" : "#4338ca"}
                />
                <ThemedText className="text-indigo-700 dark:text-white font-semibold ml-1 mr-1 text-sm">
                  Join
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRoomToEdit(null);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                className="bg-green-100 dark:bg-green-600 px-2 py-2 rounded-xl border border-green-200 dark:border-green-700 flex-row items-center"
              >
                <Ionicons
                  name="add"
                  size={17}
                  color={colorScheme === "dark" ? "#d1fae5" : "#047857"}
                />
                <ThemedText className="text-emerald-700 dark:text-white font-semibold text-sm mr-1">
                  Create
                </ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
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
          onDelete={handleLeaveRoom}
          room={optionsRoom}
        />

        <ConfirmationModal
          visible={showLeaveConfirmation}
          onClose={() => {
            setShowLeaveConfirmation(false);
            setRoomToLeave(null);
          }}
          onConfirm={confirmLeaveRoom}
          title="Leave Room"
          message={`Are you sure you want to leave "${roomToLeave?.name}"? If you are the last member, the room and all its data will be permanently deleted.`}
          confirmText="Leave"
          cancelText="Cancel"
          destructive={true}
          icon="exit-outline"
        />

        <JoinRoomModal
          visible={joinRoomModalVisible}
          onClose={() => setJoinRoomModalVisible(false)}
          onSuccess={handleJoinRoomSuccess}
        />
      </View>
    </LoadingAndErrorHandling>
  );
};

export default HomeScreen;
