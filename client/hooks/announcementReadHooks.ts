import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";

const queryClient = getQueryClient();

export const announcementReadKeys = {
  all: ["announcement-reads"] as const,
  byAnnouncement: (announcementId: number) =>
    [...announcementReadKeys.all, "announcement", announcementId] as const,
  unreadByRoom: (roomId: number, userId: number) =>
    [
      ...announcementReadKeys.all,
      "unread",
      "room",
      roomId,
      "user",
      userId,
    ] as const,
  readStatus: (announcementId: number, userId: number) =>
    [
      ...announcementReadKeys.all,
      "status",
      announcementId,
      "user",
      userId,
    ] as const,
};

export interface AnnouncementRead {
  read_id: number;
  announcement_id: number;
  membership_id: number;
  read_at: string;
  member_name: string;
}

export const useMarkAnnouncementAsReadMutation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (announcementId: number): Promise<AnnouncementRead> => {
      const res = await axiosClient.post(
        `/api/announcements/${announcementId}/read`,
        {},
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: announcementReadKeys.byAnnouncement(data.announcement_id),
      });
      queryClient.invalidateQueries({
        queryKey: announcementReadKeys.readStatus(
          data.announcement_id,
          user?.userId || 0
        ),
      });
      // Invalidate unread queries for all rooms to update the UI immediately
      queryClient.invalidateQueries({
        queryKey: announcementReadKeys.all,
      });
      // Also invalidate announcement queries to refresh the main feed
      queryClient.invalidateQueries({
        queryKey: ["announcements"],
      });
    },
  });
};

export const useAnnouncementReadersQuery = (announcementId: number) =>
  useQuery({
    queryKey: announcementReadKeys.byAnnouncement(announcementId),
    queryFn: async (): Promise<AnnouncementRead[]> => {
      const res = await axiosClient.get(
        `/api/announcements/${announcementId}/readers`
      );
      return res.data;
    },
    enabled: !!announcementId && announcementId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useAnnouncementReadStatusQuery = (announcementId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: announcementReadKeys.readStatus(
      announcementId,
      user?.userId || 0
    ),
    queryFn: async (): Promise<{ is_read: boolean }> => {
      const res = await axiosClient.get(
        `/api/announcements/${announcementId}/read-status`,
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    enabled: !!announcementId && announcementId > 0 && !!user?.userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUnreadAnnouncementsQuery = (roomId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: announcementReadKeys.unreadByRoom(roomId, user?.userId || 0),
    queryFn: async (): Promise<{ unread_announcement_ids: number[] }> => {
      const res = await axiosClient.get(
        `/api/rooms/${roomId}/unread-announcements`,
        {
          params: { user_id: user?.userId },
        }
      );
      return res.data;
    },
    enabled: !!roomId && roomId > 0 && !!user?.userId,
    staleTime: 30 * 1000, // 30 seconds for more frequent updates
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};
