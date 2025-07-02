import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Chore, ChoreCreateRequest } from "@/models/Chore";
import { useAuth } from "./user/useAuth";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const choresKeys = {
  all: ["chores"] as const,
  byRoom: (roomId: string) => ["chores", "by-room", roomId] as const,
  byId: (choreId: number) => ["chores", "by-id", choreId] as const,
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

export const useChoresByUserQuery = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useSuspenseQuery({
    queryKey: ["chores", "by-user", userId],
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get(`/api/chores/by-user/${userId}`);
      return res.data;
    },
  });
};

export const useChoresAssignedToUserQuery = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useSuspenseQuery({
    queryKey: ["chores", "assigned-to-user", userId],
    queryFn: async (): Promise<Chore[]> => {
      const res = await axiosClient.get(`/api/chores/assigned-to-user/${userId}`);
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

export const useChoreByIdQuery = (choreId: number) => {
  return useSuspenseQuery({
    queryKey: choresKeys.byId(choreId),
    queryFn: async (): Promise<Chore> => {
      const res = await axiosClient.get(`/api/chores/${choreId}`);
      return res.data;
    },
  });
};

export const useAddChoreMutation = () => {
  return useMutation({
    mutationFn: async (chore: ChoreCreateRequest): Promise<Chore> => {
      const res = await axiosClient.post("/api/chores/add", chore);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: choresKeys.byRoom(variables.roomId.toString()),
      });
      // Also invalidate the assigned chores query
      queryClient.invalidateQueries({
        queryKey: ["chores", "assigned-to-user"],
      });
    },
  });
};
