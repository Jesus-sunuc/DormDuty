import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";
import { Announcement, AnnouncementCreateRequest } from "@/models/Announcement";

const queryClient = getQueryClient();

export const announcementKeys = {
  all: ["announcements"] as const,
  byRoom: (roomId: number) =>
    [...announcementKeys.all, "room", roomId] as const,
  byId: (announcementId: number) =>
    [...announcementKeys.all, "id", announcementId] as const,
};

export const useRoomAnnouncementsQuery = (roomId: number) =>
  useQuery({
    queryKey: announcementKeys.byRoom(roomId),
    queryFn: async (): Promise<Announcement[]> => {
      const res = await axiosClient.get(`/api/announcements/room/${roomId}`);
      return res.data;
    },
    enabled: !!roomId && roomId > 0,
    staleTime: 2 * 60 * 1000,
  });

export const useAnnouncementQuery = (announcementId: number) =>
  useQuery({
    queryKey: announcementKeys.byId(announcementId),
    queryFn: async (): Promise<Announcement> => {
      const res = await axiosClient.get(`/api/announcements/${announcementId}`);
      return res.data;
    },
    enabled: !!announcementId && announcementId > 0,
    staleTime: 5 * 60 * 1000,
  });

export const useAddAnnouncementMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      announcement: AnnouncementCreateRequest
    ): Promise<Announcement> => {
      const res = await axiosClient.post(
        `/api/announcements/create`,
        announcement,
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: announcementKeys.byRoom(data.roomId),
      });
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({
        queryKey: ["announcement-reads"],
      });
    },
  });
};

export const useDeleteAnnouncementMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcementId: number): Promise<void> => {
      await axiosClient.delete(`/api/announcements/${announcementId}`, {
        params: { user_id: user?.userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
};
