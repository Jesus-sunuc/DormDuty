import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";
import {
  AnnouncementReaction,
  AnnouncementReactionCreateRequest,
} from "@/models/AnnouncementReaction";

const queryClient = getQueryClient();

export const announcementReactionKeys = {
  all: ["announcementReactions"] as const,
  byAnnouncement: (announcementId: number) =>
    ["announcementReactions", "announcement", announcementId] as const,
};

export const useAnnouncementReactionsQuery = (announcementId: number) =>
  useQuery({
    queryKey: announcementReactionKeys.byAnnouncement(announcementId),
    queryFn: async (): Promise<AnnouncementReaction[]> => {
      const res = await axiosClient.get(
        `/api/announcement-reactions/announcement/${announcementId}`
      );
      return res.data;
    },
    enabled: !!announcementId && announcementId > 0,
    staleTime: 1 * 60 * 1000,
  });

export const useCreateAnnouncementReactionMutation = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (
      reaction: AnnouncementReactionCreateRequest
    ): Promise<AnnouncementReaction> => {
      const res = await axiosClient.post(
        `/api/announcement-reactions/create`,
        reaction,
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: announcementReactionKeys.byAnnouncement(data.announcementId),
      });
    },
  });
};

export const useRemoveAnnouncementReactionMutation = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      announcementId,
    }: {
      announcementId: number;
    }): Promise<void> => {
      await axiosClient.delete(
        `/api/announcement-reactions/announcement/${announcementId}`,
        {
          params: { user_id: user?.userId },
        }
      );
    },
    onSuccess: (_, { announcementId }) => {
      queryClient.invalidateQueries({
        queryKey: announcementReactionKeys.byAnnouncement(announcementId),
      });
    },
  });
};

export const useDeleteAnnouncementReactionMutation = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      reactionId,
      announcementId,
    }: {
      reactionId: number;
      announcementId: number;
    }): Promise<void> => {
      await axiosClient.delete(`/api/announcement-reactions/${reactionId}`, {
        params: { user_id: user?.userId },
      });
    },
    onSuccess: (_, { announcementId }) => {
      queryClient.invalidateQueries({
        queryKey: announcementReactionKeys.byAnnouncement(announcementId),
      });
    },
  });
};
