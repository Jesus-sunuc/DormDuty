import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useAuth } from "@/hooks/user/useAuth";
import { useMembershipQuery } from "@/hooks/membershipHooks";
import {
  useAnnouncementQuery,
  useDeleteAnnouncementMutation,
} from "@/hooks/announcementHooks";
import {
  useMarkAnnouncementAsReadMutation,
  useAnnouncementReadersQuery,
} from "@/hooks/announcementReadHooks";
import {
  useAnnouncementRepliesQuery,
  useAddAnnouncementReplyMutation,
  useDeleteAnnouncementReplyMutation,
} from "@/hooks/announcementReplyHooks";
import {
  useAnnouncementReactionsQuery,
  useAddAnnouncementReactionMutation,
  useRemoveAnnouncementReactionMutation,
} from "@/hooks/announcementReactionHooks";
import {
  useAnnouncementReplyReactionsQuery,
  useAddAnnouncementReplyReactionMutation,
  useRemoveAnnouncementReplyReactionMutation,
} from "@/hooks/announcementReplyReactionHooks";
import { AnnouncementReply } from "@/models/AnnouncementReply";
import { LoadingAndErrorHandling } from "@/components/LoadingAndErrorHandling";
import Ionicons from "@expo/vector-icons/Ionicons";
import { toastError } from "@/components/ToastService";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

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
          <View className="bg-gray-100 dark:bg-neutral-800 rounded-2xl p-4 mx-8 shadow-lg border border-gray-300 dark:border-neutral-700">
            <ThemedText className="text-center text-lg font-semibold mb-4 text-gray-800 dark:text-white">
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
                  className="w-12 h-12 mr-1 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600"
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

const ActionsModal = ({
  visible,
  onClose,
  onDelete,
  isOwner,
}: {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  isOwner: boolean;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
        activeOpacity={1}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white dark:bg-neutral-800 rounded-t-2xl p-4 pb-8">
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-4" />

            {isOwner && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onDelete();
                }}
                className="flex-row items-center py-3 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 mb-2"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <ThemedText className="ml-3 text-red-500 font-medium">
                  Delete Post
                </ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              className="flex-row items-center py-3 px-4 rounded-xl bg-gray-50 dark:bg-neutral-700"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
              <ThemedText className="ml-3 text-gray-600 dark:text-gray-300 font-medium">
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function AnnouncementDetails() {
  const { announcementId } = useLocalSearchParams<{ announcementId: string }>();
  const { user } = useAuth();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [replyText, setReplyText] = useState("");

  const {
    data: announcement,
    isLoading: announcementLoading,
    error: announcementError,
  } = useAnnouncementQuery(parseInt(announcementId || "0"));

  const { data: membership } = useMembershipQuery(
    user?.userId || 0,
    announcement?.roomId || 0
  );

  const deleteAnnouncementMutation = useDeleteAnnouncementMutation();
  const markAsReadMutation = useMarkAnnouncementAsReadMutation();
  const createReplyMutation = useAddAnnouncementReplyMutation();

  useEffect(() => {
    if (announcement?.announcementId && user?.userId) {
      const timer = setTimeout(() => {
        markAsReadMutation.mutate(announcement.announcementId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [announcement?.announcementId, user?.userId]);
  const createReactionMutation = useAddAnnouncementReactionMutation();

  const handleEmojiSelect = async (emoji: string) => {
    if (!announcement) return;

    try {
      await createReactionMutation.mutateAsync({
        announcementId: announcement.announcementId,
        emoji,
      });
    } catch (error) {
      toastError("Failed to add reaction");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !announcement) return;
    await createReplyMutation.mutateAsync({
      announcementId: announcement.announcementId,
      message: replyText.trim(),
    });
    setReplyText("");
  };

  const handleDeleteAnnouncement = async () => {
    if (!announcement) return;

    try {
      await deleteAnnouncementMutation.mutateAsync(announcement.announcementId);
      router.navigate("/(tabs)/updates");
    } catch (error) {
      toastError("Failed to delete announcement");
    }

    setShowDeleteConfirmation(false);
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

  if (announcementLoading) {
    return (
      <LoadingAndErrorHandling isLoading={true}>
        <View />
      </LoadingAndErrorHandling>
    );
  }

  if (announcementError || !announcement) {
    return (
      <LoadingAndErrorHandling
        error={announcementError || new Error("Announcement not found")}
      >
        <View />
      </LoadingAndErrorHandling>
    );
  }

  const isCurrentUser = membership?.membershipId === announcement.createdBy;

  return (
    <>
      <View className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View
            className="px-6 pt-20"
            style={{ paddingBottom: announcement?.canReply ? 100 : 20 }}
          >
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => router.navigate("/(tabs)/updates")}
                className="mr-4"
              >
                <Ionicons name="arrow-back" size={24} color="#6b7280" />
              </TouchableOpacity>
              <ThemedText className="text-xl font-bold text-gray-800 dark:text-white flex-1">
                Announcement
              </ThemedText>
              <TouchableOpacity onPress={() => setShowActionsModal(true)}>
                <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-neutral-800">
              <View className="flex-row items-start mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                  <Ionicons name="person" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold text-gray-800 dark:text-white text-lg">
                    {announcement.memberName}
                    {isCurrentUser && (
                      <ThemedText className="text-sm text-gray-600">
                        {" "}
                        (You)
                      </ThemedText>
                    )}
                  </ThemedText>
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTimeAgo(announcement.createdAt)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText className="text-gray-700 dark:text-gray-300 leading-6 text-base mb-4">
                {announcement.message}
              </ThemedText>

              <AnnouncementReactionsSection
                announcementId={announcement.announcementId}
                membership={membership}
                onAddReaction={() => setShowEmojiPicker(true)}
              />

              <ReadersSection announcementId={announcement.announcementId} />
            </View>

            {announcement.canReply && (
              <AnnouncementRepliesSection
                announcementId={announcement.announcementId}
                membership={membership}
              />
            )}
          </View>
        </ScrollView>

        {announcement?.canReply && (
          <View className="absolute bottom-0 left-0 right-0 bg-gray-100 dark:bg-neutral-900 border-t border-gray-300 dark:border-neutral-700 pb-28 ps-3 pe-3">
            <View className="flex-row items-center mt-2">
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a reply..."
                multiline
                className="flex-1 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-gray-800 dark:text-white max-h-24 border border-gray-300 dark:border-neutral-700"
                placeholderTextColor="#6b7280"
              />
              <TouchableOpacity
                onPress={handleSendReply}
                disabled={!replyText.trim()}
                className={`ml-3 px-4 py-3 rounded-xl ${
                  replyText.trim()
                    ? "bg-blue-500 border-blue-600"
                    : "bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600"
                }`}
              >
                <Ionicons
                  name="send"
                  size={16}
                  color={replyText.trim() ? "white" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      <ActionsModal
        visible={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        onDelete={() => setShowDeleteConfirmation(true)}
        isOwner={isCurrentUser}
      />

      <ConfirmationModal
        visible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        icon="trash-outline"
      />
    </>
  );
}

function AnnouncementReactionsSection({
  announcementId,
  membership,
  onAddReaction,
}: {
  announcementId: number;
  membership?: { membershipId: number; role: string };
  onAddReaction: () => void;
}) {
  const { data: reactions = [] } =
    useAnnouncementReactionsQuery(announcementId);
  const createReactionMutation = useAddAnnouncementReactionMutation();
  const removeReactionMutation = useRemoveAnnouncementReactionMutation();

  const userReaction = reactions.find(
    (r) => r.membershipId === membership?.membershipId
  );

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
        await removeReactionMutation.mutateAsync(announcementId);
      } else {
        await createReactionMutation.mutateAsync({ announcementId, emoji });
      }
    } catch (error) {
      toastError("Failed to update reaction");
    }
  };

  return (
    <View>
      {grouped.length > 0 && (
        <View className="flex-row items-center mb-3 flex-wrap">
          {grouped.map(({ emoji, count, reacted }) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReactionPress(emoji, reacted)}
              className={`flex-row items-center px-3 py-1 rounded-full mr-2 border ${
                reacted
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
                  : "bg-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700"
              }`}
            >
              <ThemedText
                className={`text-lg ${
                  reacted ? "text-blue-500" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {emoji}
              </ThemedText>
              {count > 0 && (
                <ThemedText className="ml-2 text-sm text-gray-700 dark:text-gray-400">
                  {count}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={onAddReaction}
        className="flex-row items-center py-2 px-3 rounded-full bg-gray-200 dark:bg-neutral-800 self-start border border-gray-300 dark:border-neutral-700"
      >
        <Ionicons name="add" size={16} color="#6b7280" />
        <ThemedText className="ml-1 text-sm text-gray-700 dark:text-gray-400">
          React
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function AnnouncementRepliesSection({
  announcementId,
  membership,
}: {
  announcementId: number;
  membership?: { membershipId: number; role: string };
}) {
  const { data: replies = [], isLoading } =
    useAnnouncementRepliesQuery(announcementId);
  const deleteReplyMutation = useDeleteAnnouncementReplyMutation();

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-300 dark:border-neutral-800">
      <ThemedText className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
        Replies ({replies.length})
      </ThemedText>

      <View>
        {replies.length === 0 && !isLoading ? (
          <ThemedText className="text-center text-gray-500 py-6">
            No replies yet. Be the first to reply!
          </ThemedText>
        ) : (
          replies.map((reply) => (
            <ReplyItem
              key={reply.replyId}
              reply={reply}
              membership={membership}
              onDeleteConfirm={() => deleteReplyMutation.mutate(reply.replyId)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function ReplyItem({
  reply,
  membership,
  onDeleteConfirm,
}: {
  reply: AnnouncementReply;
  membership?: { membershipId: number; role: string };
  onDeleteConfirm: () => void;
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const createReplyReactionMutation = useAddAnnouncementReplyReactionMutation();

  const handleEmojiSelect = async (emoji: string) => {
    try {
      await createReplyReactionMutation.mutateAsync({
        replyId: reply.replyId,
        emoji,
      });
    } catch (error) {
      toastError("Failed to add reaction");
    }
    setShowEmojiPicker(false);
  };

  return (
    <>
      <View className="mb-3 p-3 bg-gray-200 dark:bg-neutral-800 rounded-lg border border-gray-300 dark:border-neutral-700">
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <ThemedText className="font-medium text-gray-800 dark:text-white text-sm">
                {reply.memberName}
                {membership?.membershipId === reply.membershipId && (
                  <ThemedText className="text-xs text-gray-600">
                    {" "}
                    (You)
                  </ThemedText>
                )}
              </ThemedText>
            </View>
            <ThemedText className="text-gray-700 dark:text-gray-300 text-sm leading-5">
              {reply.message}
            </ThemedText>
          </View>

          {membership?.membershipId === reply.membershipId && (
            <TouchableOpacity
              onPress={() => setShowDeleteConfirmation(true)}
              className="ml-2 p-1"
            >
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <ReplyReactionsSection
            replyId={reply.replyId}
            membership={membership}
          />

          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
            className="flex-row items-center"
          >
            <Ionicons name="add" size={12} color="#6b7280" />
            <ThemedText className="ml-1 text-xs text-gray-600 dark:text-gray-400">
              React
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      <ConfirmationModal
        visible={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={() => {
          onDeleteConfirm();
          setShowDeleteConfirmation(false);
        }}
        title="Delete Reply"
        message="Are you sure you want to delete this reply? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        icon="trash-outline"
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
  const createReactionMutation = useAddAnnouncementReplyReactionMutation();
  const removeReactionMutation = useRemoveAnnouncementReplyReactionMutation();

  const userReaction = reactions.find(
    (r) => r.membershipId === membership?.membershipId
  );

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
        await removeReactionMutation.mutateAsync(replyId);
      } else {
        await createReactionMutation.mutateAsync({ replyId, emoji });
      }
    } catch (error) {
      toastError("Failed to update reaction");
    }
  };

  if (grouped.length === 0) return null;

  return (
    <View className="flex-row items-center flex-wrap">
      {grouped.map(({ emoji, count, reacted }) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => handleReactionPress(emoji, reacted)}
          className={`flex-row items-center px-2 py-1 rounded-full mr-1 mb-1 border ${
            reacted
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
              : "bg-gray-200 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700"
          }`}
        >
          <ThemedText
            className={`text-xs ${
              reacted ? "text-blue-500" : "text-gray-700 dark:text-gray-300"
            }`}
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

function ReadersSection({ announcementId }: { announcementId: number }) {
  const { data: readers = [], isLoading } =
    useAnnouncementReadersQuery(announcementId);

  if (isLoading || readers.length === 0) {
    return null;
  }

  return (
    <View className="mt-4 pt-4 border-t-2 border-gray-300 dark:border-neutral-700">
      <View className="flex-row items-center mb-2">
        <Ionicons name="checkmark-done" size={16} color="#10b981" />
        <ThemedText className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Read by {readers.length} {readers.length === 1 ? "person" : "people"}
        </ThemedText>
      </View>

      <View className="flex-row flex-wrap">
        {readers.slice(0, 5).map((reader, index) => (
          <View
            key={`reader-${reader.membershipId}-${index}`}
            className="flex-row items-center bg-gray-200 dark:bg-neutral-800 rounded-full px-2 py-1 mr-2 mb-1 border border-gray-300 dark:border-neutral-700"
          >
            <View className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-1">
              <Ionicons name="checkmark" size={10} color="#10b981" />
            </View>
            <ThemedText className="text-xs text-gray-700 dark:text-gray-400">
              {reader.memberName}
            </ThemedText>
          </View>
        ))}

        {readers.length > 5 && (
          <View
            key="more-readers"
            className="flex-row items-center bg-gray-300 dark:bg-neutral-700 rounded-full px-2 py-1 border border-gray-400 dark:border-neutral-600"
          >
            <ThemedText className="text-xs text-gray-600 dark:text-gray-400">
              +{readers.length - 5} more
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}
