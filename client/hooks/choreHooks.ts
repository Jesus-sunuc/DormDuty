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
      queryClient.invalidateQueries({
        queryKey: ["chores", "assigned-to-user"],
      });
    },
  });
};

export const useUpdateChoreMutation = () => {
  return useMutation({
    mutationFn: async ({
      choreId,
      chore,
    }: {
      choreId: number;
      chore: ChoreCreateRequest;
    }): Promise<Chore> => {
      const res = await axiosClient.put(`/api/chores/${choreId}/update`, chore);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: choresKeys.byId(variables.choreId),
      });
      queryClient.invalidateQueries({
        queryKey: choresKeys.byRoom(variables.chore.roomId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: choresKeys.all,
      });
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === "chores" && query.queryKey[1] === "assigned-to-user",
      });
    },
  });
};

export const useDeleteChoreMutation = () => {
  return useMutation({
    mutationFn: async (choreId: number): Promise<void> => {
      await axiosClient.post(`/api/chores/${choreId}/delete`);
    },
    onSuccess: (_, choreId) => {
      // Invalidate the specific chore
      queryClient.invalidateQueries({
        queryKey: choresKeys.byId(choreId),
      });
      // Invalidate all chores queries to refresh the lists
      queryClient.invalidateQueries({
        queryKey: choresKeys.all,
      });
      // Invalidate all room-based queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === "chores" && 
          (query.queryKey[1] === "by-room" || query.queryKey[1] === "assigned-to-user"),
      });
    },
  });
};