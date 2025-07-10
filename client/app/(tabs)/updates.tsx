import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
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
import {
  useAnnouncementRepliesQuery,
  useCreateAnnouncementReplyMutation,
  useDeleteAnnouncementReplyMutation,
} from "@/hooks/announcementReplyHooks";
import {
  useAnnouncementReactionsQuery,
  useCreateAnnouncementReactionMutation,
  useDeleteAnnouncementReactionMutation,
  useRemoveAnnouncementReactionMutation,
} from "@/hooks/announcementReactionHooks";
import {
  useAnnouncementReplyReactionsQuery,
  useCreateAnnouncementReplyReactionMutation,
  useRemoveAnnouncementReplyReactionMutation,
} from "@/hooks/announcementReplyReactionHooks";
import { Announcement } from "@/models/Announcement";
import { AnnouncementReply } from "@/models/AnnouncementReply";
import { AnnouncementReaction } from "@/models/AnnouncementReaction";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import ParallaxScrollViewY from "@/components/ParallaxScrollViewY";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Room } from "@/models/Room";
import { toastSuccess, toastError } from "@/components/ToastService";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

// Emoji Picker Modal Component
const EmojiPicker = ({
  visible,
  onClose,
  onEmojiSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
        activeOpacity={1}
      >
        <View className="flex-1 justify-center items-center">
          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mx-8 shadow-lg">
            <ThemedText className="text-center text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              React with an emoji
            </ThemedText>
            <View className="flex-row justify-around">
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    onEmojiSelect(emoji);
                    onClose();
                  }}
                  className="w-12 h-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-700"
                >
                  <ThemedText className="text-2xl">{emoji}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const Updates = () => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newUpdate, setNewUpdate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [canReply, setCanReply] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    number | null
  >(null);

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
  const createReactionMutation = useCreateAnnouncementReactionMutation();
  const createReplyReactionMutation =
    useCreateAnnouncementReplyReactionMutation();

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  const handleEmojiSelect = async (emoji: string) => {
    if (!selectedAnnouncementId) return;

    try {
      await createReactionMutation.mutateAsync({
        announcementId: selectedAnnouncementId,
        emoji,
      });
      toastSuccess("Reaction added!");
    } catch (error) {
      toastError("Failed to add reaction");
    }
    setSelectedAnnouncementId(null);
  };

  const handleLongPress = (announcementId: number) => {
    setSelectedAnnouncementId(announcementId);
    setShowEmojiPicker(true);
  };

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
        canReply,
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

            {/* New: Toggle for canReply */}
            <View className="flex-row items-center mb-4">
              <ThemedText className="mr-2">Allow replies?</ThemedText>
              <TouchableOpacity
                onPress={() => setCanReply((prev) => !prev)}
                className={`w-10 h-6 rounded-full p-1 ${
                  canReply ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <View
                  className={`w-4 h-4 rounded-full ${
                    canReply ? "bg-white ml-4" : "bg-white"
                  }`}
                  style={{ marginLeft: canReply ? 16 : 0 }}
                />
              </TouchableOpacity>
            </View>

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
                    <TouchableOpacity
                      onLongPress={() =>
                        handleLongPress(announcement.announcementId)
                      }
                      delayLongPress={500}
                      activeOpacity={0.7}
                    >
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

                        {/* Replies and Reactions UI */}
                        {announcement.canReply && (
                          <AnnouncementRepliesSection
                            announcementId={announcement.announcementId}
                            membership={membership}
                          />
                        )}
                        <AnnouncementReactionsSection
                          announcementId={announcement.announcementId}
                          membership={membership}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        )}

        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
        />
      </View>
    </ParallaxScrollViewY>
  );
};

function AnnouncementRepliesSection({
  announcementId,
  membership,
}: {
  announcementId: number;
  membership?: { membershipId: number; role: string };
}) {
  const { user } = useAuth();
  const { data: replies = [], isLoading } =
    useAnnouncementRepliesQuery(announcementId);
  const createReplyMutation = useCreateAnnouncementReplyMutation();
  const deleteReplyMutation = useDeleteAnnouncementReplyMutation();
  const [replyText, setReplyText] = useState("");

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await createReplyMutation.mutateAsync({
      announcementId,
      message: replyText.trim(),
    });
    setReplyText("");
  };

  return (
    <View className="mt-2">
      <FlatList
        data={replies}
        keyExtractor={(reply: AnnouncementReply) => reply.replyId.toString()}
        renderItem={({ item: reply }) => (
          <ReplyItem
            reply={reply}
            membership={membership}
            onDelete={() =>
              deleteReplyMutation.mutate({
                replyId: reply.replyId,
                announcementId,
              })
            }
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <ThemedText className="text-xs text-gray-400">
              No replies yet
            </ThemedText>
          )
        }
      />
      <View className="flex-row items-center mt-2">
        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Write a reply..."
          className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white"
        />
        <TouchableOpacity
          onPress={handleSendReply}
          disabled={!replyText.trim()}
          className="ml-2 px-3 py-2 bg-blue-500 rounded-lg"
        >
          <Ionicons name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReplyItem({
  reply,
  membership,
  onDelete,
}: {
  reply: AnnouncementReply;
  membership?: { membershipId: number; role: string };
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState<number | null>(null);
  const createReplyReactionMutation =
    useCreateAnnouncementReplyReactionMutation();

  const handleLongPress = () => {
    setSelectedReplyId(reply.replyId);
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (!selectedReplyId) return;

    try {
      await createReplyReactionMutation.mutateAsync({
        replyId: selectedReplyId,
        emoji,
      });
      toastSuccess("Reaction added!");
    } catch (error) {
      toastError("Failed to add reaction");
    }
    setSelectedReplyId(null);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
        className="mb-2"
      >
        <View className="flex-row items-start">
          <ThemedText className="font-semibold mr-2 text-xs text-gray-700 dark:text-gray-300">
            {reply.memberName}
            {membership?.membershipId === reply.membershipId && " (You)"}
          </ThemedText>
          <ThemedText className="text-xs text-gray-600 dark:text-gray-400 flex-1">
            {reply.message}
          </ThemedText>
          {membership?.membershipId === reply.membershipId && (
            <TouchableOpacity onPress={onDelete} className="ml-2">
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        <ReplyReactionsSection
          replyId={reply.replyId}
          membership={membership}
        />
      </TouchableOpacity>
      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </>
  );
}

function ReplyReactionsSection({
  replyId,
  membership,
}: {
  replyId: number;
  membership?: { membershipId: number; role: string };
}) {
  const { data: reactions = [] } = useAnnouncementReplyReactionsQuery(replyId);
  const createReactionMutation = useCreateAnnouncementReplyReactionMutation();
  const removeReactionMutation = useRemoveAnnouncementReplyReactionMutation();

  // Find user's current reaction (if any)
  const userReaction = reactions.find(
    (r) => r.membershipId === membership?.membershipId
  );

  // Group reactions by emoji and only show those with reactions
  const grouped = REACTION_EMOJIS.map((emoji) => {
    const users = reactions.filter((r) => r.emoji === emoji);
    return {
      emoji,
      count: users.length,
      reacted: userReaction?.emoji === emoji,
    };
  }).filter(({ count }) => count > 0);

  const handleReactionPress = async (
    emoji: string,
    isCurrentReaction: boolean
  ) => {
    try {
      if (isCurrentReaction) {
        // Remove current reaction
        await removeReactionMutation.mutateAsync({ replyId });
      } else {
        // Add/change reaction
        await createReactionMutation.mutateAsync({ replyId, emoji });
      }
    } catch (error) {
      toastError("Failed to update reaction");
    }
  };

  if (grouped.length === 0) return null;

  return (
    <View className="flex-row items-center mt-1 ml-4">
      {grouped.map(({ emoji, count, reacted }) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => handleReactionPress(emoji, reacted)}
          className={`flex-row items-center px-1.5 py-0.5 rounded-full mr-1 ${
            reacted
              ? "bg-blue-100 dark:bg-blue-900"
              : "bg-gray-100 dark:bg-neutral-800"
          }`}
        >
          <ThemedText
            className={`text-sm ${
              reacted ? "text-blue-500" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {emoji}
          </ThemedText>
          {count > 0 && (
            <ThemedText className="ml-0.5 text-xs text-gray-600 dark:text-gray-400">
              {count}
            </ThemedText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AnnouncementReactionsSection({
  announcementId,
  membership,
}: {
  announcementId: number;
  membership?: { membershipId: number; role: string };
}) {
  const { user } = useAuth();
  const { data: reactions = [] } =
    useAnnouncementReactionsQuery(announcementId);
  const createReactionMutation = useCreateAnnouncementReactionMutation();
  const removeReactionMutation = useRemoveAnnouncementReactionMutation();

  // Find user's current reaction (if any)
  const userReaction = reactions.find(
    (r) => r.membershipId === membership?.membershipId
  );

  // Group reactions by emoji and filter out ones with no reactions
  const grouped = REACTION_EMOJIS.map((emoji) => {
    const users = reactions.filter((r) => r.emoji === emoji);
    return {
      emoji,
      count: users.length,
      reacted: userReaction?.emoji === emoji,
      reactionId: userReaction?.reactionId,
    };
  }).filter(({ count }) => count > 0); // Only show emojis that have at least one reaction

  const handleReactionPress = async (
    emoji: string,
    isCurrentReaction: boolean
  ) => {
    try {
      if (isCurrentReaction) {
        // Remove current reaction
        await removeReactionMutation.mutateAsync({ announcementId });
      } else {
        // Add/change reaction
        await createReactionMutation.mutateAsync({ announcementId, emoji });
      }
    } catch (error) {
      toastError("Failed to update reaction");
    }
  };

  return (
    <View className="flex-row items-center mt-2">
      {grouped.map(({ emoji, count, reacted }) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => handleReactionPress(emoji, reacted)}
          className={`flex-row items-center px-2 py-1 rounded-full mr-2 ${reacted ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-neutral-800"}`}
        >
          <ThemedText
            className={`text-lg ${reacted ? "text-blue-500" : "text-gray-700 dark:text-gray-300"}`}
          >
            {emoji}
          </ThemedText>
          {count > 0 && (
            <ThemedText className="ml-1 text-xs text-gray-600 dark:text-gray-400">
              {count}
            </ThemedText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default Updates;
