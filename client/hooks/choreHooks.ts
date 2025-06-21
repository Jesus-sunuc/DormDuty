import { useSuspenseQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Chore } from "@/models/Chore";

export const choresKeys = {
  all: ["chores"] as const,
  byRoom: (roomId: string) => ["chores", "by-room", roomId] as const,
};

export function useChoresQuery() {
  return useSuspenseQuery({
    queryKey: choresKeys.all,
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get("/api/chores/all");
      return res.data;
    },
  });
}


export function useChoresByRoomQuery(roomId: string) {
  return useSuspenseQuery({
    queryKey: choresKeys.byRoom(roomId),
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get(`/api/chores/by-room/${roomId}`);
      return res.data;
    },
  });
}