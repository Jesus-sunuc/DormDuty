import { useUnreadAnnouncementsQuery } from "@/hooks/announcementReadHooks";
import { useRoomsByUserQuery } from "@/hooks/roomHooks";
import { useMemo } from "react";

export const useUnreadAnnouncementsCount = () => {
  const { data: rooms, isLoading, error } = useRoomsByUserQuery();

  const roomIds = useMemo(() => {
    if (!rooms || isLoading || error) {
      return [];
    }
    return rooms.map((room) => room.roomId);
  }, [rooms, isLoading, error]);

  const MAX_ROOMS = 10;
  const paddedRoomIds = [
    ...roomIds,
    ...Array(MAX_ROOMS - roomIds.length).fill(0),
  ];

  const unreadQueries = paddedRoomIds
    .slice(0, MAX_ROOMS)
    .map((roomId) => useUnreadAnnouncementsQuery(roomId));

  const totalUnread = useMemo(() => {
    if (isLoading || error || !rooms) {
      return 0;
    }

    return unreadQueries.reduce((total, query, index) => {
      if (index >= roomIds.length || roomIds[index] === 0) {
        return total;
      }

      if (query.isLoading || query.error || !query.data) {
        return total;
      }
      const unreadCount = query.data.unreadAnnouncementIds?.length || 0;
      return total + unreadCount;
    }, 0);
  }, [isLoading, error, rooms, roomIds, unreadQueries]);

  return totalUnread;
};
