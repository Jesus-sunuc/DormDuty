import { useState, useEffect } from "react";
import { View, TouchableOpacity, FlatList, TextInput } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/user/useAuth";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import {
  useRoomAnnouncementsQuery,
  useAddAnnouncementMutation,
} from "@/hooks/announcementHooks";
import { useAnnouncementReactionsQuery } from "@/hooks/announcementReactionHooks";
import { useUnreadAnnouncementsQuery } from "@/hooks/announcementReadHooks";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Room } from "@/models/Room";
import { toastError } from "@/components/ToastService";
import { Header } from "@/components/ui/Header";
import { useSidebar } from "@/hooks/useSidebar";

const Updates = () => {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [canReply, setCanReply] = useState(false);

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

  const { data: unreadData } = useUnreadAnnouncementsQuery(
    selectedRoom?.roomId || 0
  );
  const unreadAnnouncementIds = unreadData?.unreadAnnouncementIds || [];

  const createAnnouncementMutation = useAddAnnouncementMutation();

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  const handleCreateUpdate = async () => {
    if (!newUpdate.trim() || !selectedRoom) return;

    setIsCreating(true);
    try {
      await createAnnouncementMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        message: newUpdate.trim(),
        canReply,
      });

      setNewUpdate("");
    } catch (error) {
      console.error("Failed to post update:", error);
      toastError("Failed to post update");
    } finally {
      setIsCreating(false);
    }
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

  const getPreviewText = (message: string, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  if (roomsLoading || announcementsLoading || membershipLoading) {
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
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
        <ThemedText className="text-center text-gray-400 mt-4 text-lg font-medium">
          No apartments yet
        </ThemedText>
        <ThemedText className="text-center text-gray-500 mt-2 text-sm">
          Join or create an apartment to start receiving updates
        </ThemedText>
      </View>
    );
  }

  return (
    <LoadingAndErrorHandling
      isLoading={roomsLoading || announcementsLoading || membershipLoading}
      error={roomsError || announcementsError}
    >
      <View className="flex-1 bg-gray-100 dark:bg-black">
        <Header title="Updates" onMenuPress={openSidebar} />
        {selectedRoom ? (
          <FlatList
            data={announcements}
            keyExtractor={(announcement) =>
              announcement.announcementId.toString()
            }
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {rooms.length > 1 && (
                  <View className="mb-6">
                    <ThemedText className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                      Select Apartment
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
                              : "bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700"
                          }`}
                        >
                          <ThemedText
                            className={`font-medium ${
                              selectedRoom?.roomId === room.roomId
                                ? "text-white"
                                : "text-gray-800 dark:text-white"
                            }`}
                          >
                            {room.name}
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {membership && (
                  <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-300 dark:border-neutral-800">
                    <View className="flex-row items-center mb-4">
                      <Ionicons name="add-circle" size={24} color="#3b82f6" />
                      <ThemedText className="text-lg font-semibold ml-2 text-gray-800 dark:text-white">
                        Post Update
                      </ThemedText>
                    </View>

                    <TextInput
                      value={newUpdate}
                      onChangeText={setNewUpdate}
                      placeholder="Share an update with your roommates..."
                      multiline
                      numberOfLines={4}
                      className="bg-gray-200 dark:bg-neutral-800 rounded-xl p-4 text-gray-800 dark:text-white mb-4 min-h-[100px] text-base border border-gray-300 dark:border-neutral-700"
                      placeholderTextColor="#6b7280"
                    />

                    <View className="flex-row items-center mb-4">
                      <Ionicons
                        name="chatbubbles-outline"
                        size={20}
                        color="#6b7280"
                      />
                      <ThemedText className="ml-2 mr-3 text-gray-700 dark:text-gray-300">
                        Allow replies?
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => setCanReply((prev) => !prev)}
                        className={`w-12 h-6 rounded-full border transition-colors ${
                          canReply
                            ? "bg-blue-500 border-blue-500"
                            : "bg-gray-300 dark:bg-neutral-700 border-gray-200 dark:border-neutral-600"
                        }`}
                      >
                        <View
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            canReply ? "translate-x-6" : "translate-x-0"
                          }`}
                          style={{ marginTop: 2, marginLeft: canReply ? 2 : 2 }}
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={handleCreateUpdate}
                      disabled={isCreating || !newUpdate.trim()}
                      className={`py-3 px-6 rounded-xl flex-row items-center justify-center ${
                        isCreating || !newUpdate.trim()
                          ? "bg-gray-400 dark:bg-gray-700 border-gray-500 dark:border-gray-600"
                          : "bg-blue-500 border-blue-600"
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

                <View className="flex-row items-center justify-between mb-4">
                  <ThemedText className="text-lg font-semibold text-gray-800 dark:text-white">
                    Recent Updates ({announcements.length})
                  </ThemedText>
                  {unreadAnnouncementIds.length > 0 && (
                    <View className="bg-blue-500 rounded-full px-3 py-1 min-w-[32px] items-center">
                      <ThemedText className="text-white text-xs font-medium">
                        {unreadAnnouncementIds.length} new
                      </ThemedText>
                    </View>
                  )}
                </View>
              </>
            }
            renderItem={({ item: announcement }) => {
              const isCurrentUser =
                membership?.membershipId === announcement.createdBy;
              return (
                <AnnouncementNotificationCard
                  announcement={announcement}
                  isCurrentUser={isCurrentUser}
                  onPress={() =>
                    router.push(
                      `/(tabs)/announcement-details/${announcement.announcementId}`
                    )
                  }
                  formatTimeAgo={formatTimeAgo}
                  getPreviewText={getPreviewText}
                  unreadAnnouncementIds={unreadAnnouncementIds}
                />
              );
            }}
            ListEmptyComponent={
              <View className="bg-gray-100 dark:bg-neutral-900 rounded-2xl p-8 items-center border border-gray-300 dark:border-neutral-800">
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#9ca3af"
                />
                <ThemedText className="text-center text-gray-500 mt-3 text-base font-medium">
                  No updates yet
                </ThemedText>
                <ThemedText className="text-center text-gray-600 mt-1 text-sm">
                  Be the first to share an update with your roommates
                </ThemedText>
              </View>
            }
          />
        ) : (
          <View className="flex-1 px-6 pt-20">
            {rooms.length > 0 && (
              <View className="mb-6">
                <ThemedText className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Select an Apartment
                </ThemedText>
                {rooms.map((room) => (
                  <TouchableOpacity
                    key={room.roomId}
                    onPress={() => setSelectedRoom(room)}
                    className="mb-3 p-4 rounded-2xl border bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                  >
                    <ThemedText className="font-medium text-gray-900 dark:text-white text-lg">
                      {room.name}
                    </ThemedText>
                    <ThemedText className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Tap to view updates
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </LoadingAndErrorHandling>
  );
};

function AnnouncementNotificationCard({
  announcement,
  isCurrentUser,
  onPress,
  formatTimeAgo,
  getPreviewText,
  unreadAnnouncementIds,
}: {
  announcement: any;
  isCurrentUser: boolean;
  onPress: () => void;
  formatTimeAgo: (date: string) => string;
  getPreviewText: (text: string, maxLength?: number) => string;
  unreadAnnouncementIds: number[];
}) {
  const { data: reactions = [] } = useAnnouncementReactionsQuery(
    announcement.announcementId
  );

  const totalReactions = reactions.length;

  const isUnread = unreadAnnouncementIds.includes(announcement.announcementId);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl p-4 mb-3 border ${
        isUnread
          ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
          : "bg-gray-100 dark:bg-neutral-900 border-gray-300 dark:border-neutral-800"
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="relative mr-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isUnread
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-gray-200 dark:bg-neutral-700"
            }`}
          >
            <Ionicons
              name="chatbubble"
              size={18}
              color={isUnread ? "#3b82f6" : "#6b7280"}
            />
          </View>
          {isUnread && (
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white dark:border-neutral-900" />
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1">
              <ThemedText
                className={`font-semibold ${
                  isUnread
                    ? "text-gray-800 dark:text-white"
                    : "text-gray-800 dark:text-white"
                }`}
              >
                {announcement.memberName}
                {isCurrentUser && (
                  <ThemedText className="text-sm text-gray-600">
                    {" "}
                    (You)
                  </ThemedText>
                )}
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
                {formatTimeAgo(announcement.createdAt)}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            className={`leading-5 mb-2 text-sm ${
              isUnread
                ? "text-gray-800 dark:text-gray-200 font-medium"
                : "text-gray-700 dark:text-gray-400"
            }`}
          >
            {getPreviewText(announcement.message)}
          </ThemedText>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              {totalReactions > 0 && (
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={14} color="#f59e0b" />
                  <ThemedText className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                    {totalReactions}
                  </ThemedText>
                </View>
              )}
            </View>

            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default Updates;
