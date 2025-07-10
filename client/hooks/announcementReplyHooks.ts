import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";
import {
  AnnouncementReply,
  AnnouncementReplyCreateRequest,
} from "@/models/AnnouncementReply";

const queryClient = getQueryClient();

export const announcementReplyKeys = {
  all: ["announcementReplies"] as const,
  byAnnouncement: (announcementId: number) =>
    ["announcementReplies", "announcement", announcementId] as const,
};

export const useAnnouncementRepliesQuery = (announcementId: number) =>
  useQuery({
    queryKey: announcementReplyKeys.byAnnouncement(announcementId),
    queryFn: async (): Promise<AnnouncementReply[]> => {
      const res = await axiosClient.get(
        `/api/announcement-replies/announcement/${announcementId}`
      );
      return res.data;
    },
    enabled: !!announcementId && announcementId > 0,
    staleTime: 1 * 60 * 1000,
  });

export const useAddAnnouncementReplyMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      reply: AnnouncementReplyCreateRequest
    ): Promise<AnnouncementReply> => {
      const res = await axiosClient.post(
        `/api/announcement-replies/create`,
        reply,
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: announcementReplyKeys.byAnnouncement(data.announcementId),
      });
    },
  });
};

export const useDeleteAnnouncementReplyMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (replyId: number): Promise<void> => {
      await axiosClient.delete(`/api/announcement-replies/${replyId}`, {
        params: { user_id: user?.userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementReplyKeys.all });
    },
  });
};
