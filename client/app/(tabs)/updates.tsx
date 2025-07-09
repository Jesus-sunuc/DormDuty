import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import {
  useRoomAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from "@/hooks/announcementHooks";
import { Announcement } from "@/models/Announcement";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Room } from "@/models/Room";
import { toastSuccess, toastError } from "@/components/ToastService";

const Updates = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    error: roomsError,
  } = useRoomsByUserQuery();

  const { data: membership, isLoading: membershipLoading } = useMembershipQuery(
    user?.userId || 0,
    selectedRoom?.roomId || 0
  );

  const {
    data: announcements = [],
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useRoomAnnouncementsQuery(selectedRoom?.roomId || 0);

  const createAnnouncementMutation = useCreateAnnouncementMutation();
  const deleteAnnouncementMutation = useDeleteAnnouncementMutation();

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  const handleCreateUpdate = async () => {
    if (!newUpdate.trim() || !selectedRoom || !membership) {
      toastError("Please enter a message and select a room");
      return;
    }

    setIsCreating(true);

    try {
      await createAnnouncementMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        message: newUpdate.trim(),
      });

      setNewUpdate("");
      toastSuccess("Update posted successfully!");
    } catch (error) {
      toastError("Failed to post update");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUpdate = async (announcementId: number) => {
    if (!selectedRoom) return;

    Alert.alert(
      "Delete Update",
      "Are you sure you want to delete this update?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAnnouncementMutation.mutateAsync({
                announcementId,
                roomId: selectedRoom.roomId,
              });
              toastSuccess("Update deleted successfully!");
            } catch (error) {
              toastError("Failed to delete update");
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (isCurrentUser: boolean) => {
    return isCurrentUser ? "#3b82f6" : "#6b7280";
  };

  const getPriorityIcon = (isCurrentUser: boolean) => {
    return isCurrentUser ? "person" : "chatbubble";
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (roomsLoading || membershipLoading || announcementsLoading) {
    return (
      <LoadingAndErrorHandling isLoading={true}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  if (roomsError || announcementsError) {
    return (
      <LoadingAndErrorHandling error={roomsError || announcementsError}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  if (rooms.length === 0) {
    return (
      <ParallaxScrollViewY>
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
            No rooms yet
          </ThemedText>
          <ThemedText className="text-center text-gray-500 mt-2 text-sm">
            Join or create a room to start receiving updates
          </ThemedText>
        </View>
      </ParallaxScrollViewY>
    );
  }

  return (
    <ParallaxScrollViewY>
      <View className="px-6 pt-20">
        {/* Room Selection */}
        {rooms.length > 0 && (
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {rooms.length > 1 ? "Select Room" : "Room"}
            </ThemedText>
            <FlatList
              data={rooms}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(room) => room.roomId.toString()}
              renderItem={({ item: room }) => (
                <TouchableOpacity
                  onPress={() => setSelectedRoom(room)}
                  className={`mr-3 px-4 py-2 rounded-2xl border ${
                    selectedRoom?.roomId === room.roomId
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <ThemedText
                    className={`font-medium ${
                      selectedRoom?.roomId === room.roomId
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {room.name}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Create Update Section */}
        {selectedRoom && membership && (
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-neutral-800">
            <View className="flex-row items-center mb-4">
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
              <ThemedText className="text-lg font-semibold ml-2 text-gray-900 dark:text-white">
                Post Update
              </ThemedText>
            </View>

            <TextInput
              value={newUpdate}
              onChangeText={setNewUpdate}
              placeholder="Share an update with your roommates..."
              multiline
              numberOfLines={4}
              className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 text-gray-900 dark:text-white mb-4 min-h-[100px] text-base"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              onPress={handleCreateUpdate}
              disabled={isCreating || !newUpdate.trim()}
              className={`py-3 px-6 rounded-xl flex-row items-center justify-center ${
                isCreating || !newUpdate.trim()
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "bg-blue-500"
              }`}
            >
              {isCreating ? (
                <>
                  <Ionicons name="sync" size={20} color="white" />
                  <ThemedText className="text-white font-medium ml-2">
                    Posting...
                  </ThemedText>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <ThemedText className="text-white font-medium ml-2">
                    Post Update
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Updates List */}
        {selectedRoom && (
          <View>
            <ThemedText className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Updates ({announcements.length})
            </ThemedText>

            {announcements.length === 0 ? (
              <View className="bg-white dark:bg-neutral-900 rounded-2xl p-8 items-center shadow-sm border border-gray-100 dark:border-neutral-800">
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#9ca3af"
                />
                <ThemedText className="text-center text-gray-400 mt-3 text-base font-medium">
                  No updates yet
                </ThemedText>
                <ThemedText className="text-center text-gray-500 mt-1 text-sm">
                  Be the first to share an update with your roommates
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={announcements}
                keyExtractor={(announcement) =>
                  announcement.announcementId.toString()
                }
                scrollEnabled={false}
                renderItem={({ item: announcement }) => {
                  const isCurrentUser =
                    membership?.membershipId === announcement.createdBy;
                  return (
                    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-neutral-800">
                      <View className="flex-row items-start mb-3">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{
                            backgroundColor:
                              getPriorityColor(isCurrentUser) + "20",
                          }}
                        >
                          <Ionicons
                            name={getPriorityIcon(isCurrentUser) as any}
                            size={20}
                            color={getPriorityColor(isCurrentUser)}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-1">
                            <ThemedText className="font-semibold text-gray-900 dark:text-white">
                              {announcement.memberName}
                              {isCurrentUser && (
                                <ThemedText className="text-sm text-gray-500">
                                  {" "}
                                  (You)
                                </ThemedText>
                              )}
                            </ThemedText>
                            <View className="flex-row items-center">
                              <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                {formatTimeAgo(announcement.createdAt)}
                              </ThemedText>
                              {isCurrentUser && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleDeleteUpdate(
                                      announcement.announcementId
                                    )
                                  }
                                  className="p-1"
                                >
                                  <Ionicons
                                    name="trash-outline"
                                    size={16}
                                    color="#ef4444"
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                      <ThemedText className="text-gray-700 dark:text-gray-300 leading-5">
                        {announcement.message}
                      </ThemedText>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
    </ParallaxScrollViewY>
  );
};

export default Updates;
