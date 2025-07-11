import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { AnnouncementReplyReaction } from "@/models/AnnouncementReplyReaction";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";

const queryClient = getQueryClient();

export const announcementReplyReactionKeys = {
  all: ["announcementReplyReactions"] as const,
  byReply: (replyId: number) =>
    ["announcementReplyReactions", "reply", replyId] as const,
};

export const useAnnouncementReplyReactionsQuery = (replyId: number) =>
  useQuery({
    queryKey: announcementReplyReactionKeys.byReply(replyId),
    queryFn: async (): Promise<AnnouncementReplyReaction[]> => {
      const response = await axiosClient.get(
        `/api/announcement-reply-reactions/reply/${replyId}`
      );
      return response.data;
    },
    enabled: !!replyId && replyId > 0,
    staleTime: 1 * 60 * 1000,
  });

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
          replyId,
          emoji,
        },
        {
          params: { user_id: user?.userId },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: announcementReplyReactionKeys.byReply(variables.replyId),
      });
    },
  });
};

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
