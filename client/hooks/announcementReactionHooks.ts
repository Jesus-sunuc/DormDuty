import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getQueryClient } from "@/services/queryClient";
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

export const useAddAnnouncementReactionMutation = () =>
  useMutation({
    mutationFn: async (
      reaction: AnnouncementReactionCreateRequest
    ): Promise<AnnouncementReaction> => {
      const res = await axiosClient.post(
        `/api/announcement-reactions/create`,
        reaction
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: announcementReactionKeys.byAnnouncement(data.announcementId),
      });
    },
  });

export const useRemoveAnnouncementReactionMutation = () =>
  useMutation({
    mutationFn: async (announcementId: number): Promise<void> => {
      await axiosClient.delete(
        `/api/announcement-reactions/announcement/${announcementId}`
      );
    },
    onSuccess: (_, announcementId) => {
      queryClient.invalidateQueries({
        queryKey: announcementReactionKeys.byAnnouncement(announcementId),
      });
    },
  });

export const useDeleteAnnouncementReactionMutation = () =>
  useMutation({
    mutationFn: async (reactionId: number): Promise<void> => {
      await axiosClient.delete(`/api/announcement-reactions/${reactionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementReactionKeys.all });
    },
  });
