import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";

export const membershipKeys = {
  all: ["membership"] as const,
  byUserAndRoom: (userId: number, roomId: number) =>
    [...membershipKeys.all, userId, roomId] as const,
};

export const useMembershipQuery = (
  userId: number,
  roomId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: membershipKeys.byUserAndRoom(userId, roomId),
    queryFn: async (): Promise<{ membershipId: number; role: string }> => {
      const res = await axiosClient.get(
        `/api/membership/user/${userId}/room/${roomId}`,
        {
          params: { user_id: userId, room_id: roomId },
        }
      );
      return res.data;
    },
    enabled: options?.enabled ?? true,
  });
