import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Chore, ChoreCreateRequest } from "@/models/Chore";

export const choresKeys = {
  all: ["chores"] as const,
  byRoom: (roomId: string) => ["chores", "by-room", roomId] as const,
};

export const useChoresQuery = () => {
  return useSuspenseQuery({
    queryKey: choresKeys.all,
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get("/api/chores/all");
      return res.data;
    },
  });
};

export const useChoresByRoomQuery = (roomId: string) => {
  return useSuspenseQuery({
    queryKey: choresKeys.byRoom(roomId),
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get(`/api/chores/by-room/${roomId}`);
      return res.data;
    },
  });
};

export const useAddChoreMutation = () => {
  return useMutation({
    mutationFn: async (chore: ChoreCreateRequest): Promise<Chore> => {
      const res = await axiosClient.post("/api/chores/add", chore);
      console.log("Chore added:", res.data);
      return res.data;
    },
  });
};
