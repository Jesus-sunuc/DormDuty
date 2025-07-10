import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { AnnouncementReplyReaction } from "@/models/AnnouncementReplyReaction";
import { snakeToCamel } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";

const queryClient = getQueryClient();

export const announcementReplyReactionKeys = {
  all: ["announcementReplyReactions"] as const,
  byReply: (replyId: number) =>
    ["announcementReplyReactions", "reply", replyId] as const,
};

// Get reactions for a specific reply
export const useAnnouncementReplyReactionsQuery = (replyId: number) =>
  useQuery({
    queryKey: announcementReplyReactionKeys.byReply(replyId),
    queryFn: async (): Promise<AnnouncementReplyReaction[]> => {
      const response = await axiosClient.get(
        `/api/announcement-reply-reactions/reply/${replyId}`
      );
      return response.data.map(snakeToCamel<AnnouncementReplyReaction>);
    },
    enabled: !!replyId && replyId > 0,
    staleTime: 1 * 60 * 1000,
  });

// Create a reaction for a reply
export const useAddAnnouncementReplyReactionMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      replyId,
      emoji,
    }: {
      replyId: number;
      emoji: string;
    }): Promise<AnnouncementReplyReaction> => {
      const response = await axiosClient.post(
        `/api/announcement-reply-reactions/create`,
        {
          reply_id: replyId,
          emoji,
        },
        {
          params: { user_id: user?.userId },
        }
      );
      return snakeToCamel<AnnouncementReplyReaction>(response.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: announcementReplyReactionKeys.byReply(variables.replyId),
      });
    },
  });
};

// Remove a reaction from a reply
export const useRemoveAnnouncementReplyReactionMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (replyId: number): Promise<void> => {
      await axiosClient.delete(
        `/api/announcement-reply-reactions/reply/${replyId}`,
        {
          params: { user_id: user?.userId },
        }
      );
    },
    onSuccess: (_, replyId) => {
      queryClient.invalidateQueries({
        queryKey: announcementReplyReactionKeys.byReply(replyId),
      });
    },
  });
};
