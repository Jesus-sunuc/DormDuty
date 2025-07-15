import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import {
  Chore,
  ChoreCreateRequest,
  ChoreCompletion,
  ChoreCompletionCreateRequest,
  ChoreVerificationCreateRequest,
  ChoreWithCompletionStatus,
} from "@/models/Chore";
import { useAuth } from "./user/useAuth";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const choresKeys = {
  all: ["chores"] as const,
  byRoom: (roomId: string) => ["chores", "by-room", roomId] as const,
  byId: (choreId: number) => ["chores", "by-id", choreId] as const,
};

export const useChoresQuery = () => {
  return useQuery({
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

  return useQuery({
    queryKey: ["chores", "by-user", userId],
    queryFn: async (): Promise<Chore[]> => {
      if (!userId) return [];
      const res = await axiosClient.get(`/api/chores/by-user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useChoresAssignedToUserQuery = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: ["chores", "assigned-to-user", userId],
    queryFn: async (): Promise<Chore[]> => {
      if (!userId) return [];
      const res = await axiosClient.get(
        `/api/chores/assigned-to-user/${userId}`
      );
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useChoresAssignedWithStatusQuery = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: ["chores", "assigned-with-status", userId],
    queryFn: async (): Promise<{
      chores: Chore[];
      rejectedCompletions: ChoreCompletion[];
    }> => {
      if (!userId) return { chores: [], rejectedCompletions: [] };

      const assignedChoresRes = await axiosClient.get(
        `/api/chores/assigned-to-user/${userId}`
      );
      const assignedChores = assignedChoresRes.data;

      const roomsRes = await axiosClient.get(`/api/rooms/by-user/${userId}`);
      const rooms = roomsRes.data;

      let allRejected: ChoreCompletion[] = [];
      let approvedChoreIds = new Set<number>();

      for (const room of rooms) {
        const completionsRes = await axiosClient.get(
          `/api/chores/user/${userId}/completions?room_id=${room.roomId}`
        );
        const completionsData = completionsRes.data;

        const completions: ChoreCompletion[] = completionsData.map(
          (compArray: any[]) => ({
            completionId: compArray[0],
            choreId: compArray[1],
            membershipId: compArray[2],
            completedAt: compArray[3],
            photoUrl: compArray[4],
            status: compArray[5] as "pending" | "approved" | "rejected",
            createdAt: compArray[6],
          })
        );

        const recentRejected = completions.filter((comp: ChoreCompletion) => {
          const isRejected = comp.status === "rejected";
          const isRecent =
            new Date(comp.completedAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return isRejected && isRecent;
        });
        allRejected.push(...recentRejected);

        const roomApprovedIds = completions
          .filter((comp: ChoreCompletion) => comp.status === "approved")
          .map((comp: ChoreCompletion) => comp.choreId);

        roomApprovedIds.forEach((id: number) => approvedChoreIds.add(id));
      }

      const filteredChores = assignedChores.filter((chore: Chore) => {
        return !approvedChoreIds.has(chore.choreId);
      });

      return {
        chores: filteredChores,
        rejectedCompletions: allRejected,
      };
    },
    enabled: !!userId,
  });
};

export const useChoresByRoomQuery = (roomId: string) => {
  return useQuery({
    queryKey: choresKeys.byRoom(roomId),
    queryFn: async (): Promise<Chore[]> => {
      if (!roomId) return [];
      const res = await axiosClient.get(`/api/chores/by-room/${roomId}`);
      return res.data;
    },
    enabled: !!roomId,
  });
};

export const useChoreByIdQuery = (choreId: number) => {
  return useQuery({
    queryKey: choresKeys.byId(choreId),
    queryFn: async (): Promise<Chore> => {
      const res = await axiosClient.get(`/api/chores/${choreId}`);
      return res.data;
    },
    enabled: !!choreId && choreId > 0 && !isNaN(choreId),
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
          query.queryKey[0] === "chores" &&
          (query.queryKey[1] === "assigned-to-user" ||
            query.queryKey[1] === "assigned-with-status"),
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
      queryClient.invalidateQueries({
        queryKey: choresKeys.byId(choreId),
      });
      queryClient.invalidateQueries({
        queryKey: choresKeys.all,
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "chores" &&
          (query.queryKey[1] === "by-room" ||
            query.queryKey[1] === "assigned-to-user" ||
            query.queryKey[1] === "assigned-with-status"),
      });
    },
  });
};

export const useChoresWithCompletionStatusQuery = (
  roomId: number,
  userId?: number
) => {
  return useQuery({
    queryKey: ["chores", "with-completion-status", roomId, userId],
    queryFn: async (): Promise<ChoreWithCompletionStatus[]> => {
      const params = userId ? `?user_id=${userId}` : "";
      const res = await axiosClient.get(
        `/api/chores/room/${roomId}/with-completion-status${params}`
      );
      return res.data;
    },
    enabled: !!roomId,
  });
};

export const useCompleteChoreMutation = () => {
  return useMutation({
    mutationFn: async ({
      choreId,
      membershipId,
      completionRequest,
    }: {
      choreId: number;
      membershipId: number;
      completionRequest: ChoreCompletionCreateRequest;
    }) => {
      const res = await axiosClient.post(
        `/api/chores/${choreId}/complete?membership_id=${membershipId}`,
        completionRequest
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "chores",
      });
    },
  });
};

export const usePendingCompletionsByRoomQuery = (roomId: number) => {
  return useQuery({
    queryKey: ["chores", "pending-completions", roomId],
    queryFn: async () => {
      const res = await axiosClient.get(
        `/api/chores/room/${roomId}/pending-completions`
      );
      return res.data as ChoreCompletion[];
    },
    enabled: !!roomId && roomId > 0,
  });
};

export const useUserCompletionsQuery = (userId: number, roomId?: number) => {
  return useQuery({
    queryKey: ["chores", "user-completions", userId, roomId],
    queryFn: async () => {
      const params = new URLSearchParams({ user_id: String(userId) });
      if (roomId) params.append("room_id", String(roomId));

      const res = await axiosClient.get(
        `/api/chores/user-completions?${params}`
      );
      return res.data as ChoreCompletion[];
    },
    enabled: !!userId && userId > 0,
  });
};

export const useVerifyCompletionMutation = () => {
  return useMutation({
    mutationFn: async ({
      completionId,
      membershipId,
      verificationRequest,
    }: {
      completionId: number;
      membershipId: number;
      verificationRequest: ChoreVerificationCreateRequest;
    }) => {
      const res = await axiosClient.post(
        `/api/chores/completions/${completionId}/verify?verified_by_membership_id=${membershipId}`,
        verificationRequest
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "chores" &&
          (query.queryKey.includes("pending-completions") ||
            query.queryKey.includes("with-completion-status")),
      });
    },
  });
};
