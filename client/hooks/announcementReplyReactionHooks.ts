import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { AnnouncementReplyReaction } from "@/models/AnnouncementReplyReaction";
import { snakeToCamel } from "@/utils/apiMapper";

// Get reactions for a specific reply
export const useAnnouncementReplyReactionsQuery = (replyId: number) => {
  return useQuery({
    queryKey: ["announcementReplyReactions", replyId],
    queryFn: async (): Promise<AnnouncementReplyReaction[]> => {
      const response = await axiosClient.get(
        `/api/announcement-reply-reactions/reply/${replyId}`
      );
      return response.data.map(snakeToCamel<AnnouncementReplyReaction>);
    },
    enabled: !!replyId,
  });
};

// Create a reaction for a reply
export const useCreateAnnouncementReplyReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      emoji,
    }: {
      replyId: number;
      emoji: string;
    }) => {
      const response = await axiosClient.post(
        `/api/announcement-reply-reactions/`,
        {
          reply_id: replyId,
          emoji,
        }
      );
      return snakeToCamel<AnnouncementReplyReaction>(response.data);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch reply reactions
      queryClient.invalidateQueries({
        queryKey: ["announcementReplyReactions", variables.replyId],
      });
    },
  });
};

// Remove a reaction from a reply
export const useRemoveAnnouncementReplyReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ replyId }: { replyId: number }) => {
      await axiosClient.delete(
        `/api/announcement-reply-reactions/reply/${replyId}`
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch reply reactions
      queryClient.invalidateQueries({
        queryKey: ["announcementReplyReactions", variables.replyId],
      });
    },
  });
};
