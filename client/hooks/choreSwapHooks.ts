import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import {
  ChoreSwapRequest,
  ChoreSwapRequestCreateRequest,
  ChoreSwapRequestResponseRequest,
} from "@/models/ChoreSwapRequest";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const choreSwapKeys = {
  all: ["chore-swap"] as const,
  byUser: (membershipId: number) =>
    ["chore-swap", "by-user", membershipId] as const,
  pending: (membershipId: number) =>
    ["chore-swap", "pending", membershipId] as const,
  byRoom: (roomId: number) => ["chore-swap", "by-room", roomId] as const,
  byId: (swapId: number) => ["chore-swap", "by-id", swapId] as const,
};

export const useCreateSwapRequestMutation = () => {
  return useMutation({
    mutationFn: async ({
      fromMembershipId,
      request,
    }: {
      fromMembershipId: number;
      request: ChoreSwapRequestCreateRequest;
    }) => {
      const res = await axiosClient.post(
        `/api/chore-swap/request?from_membership_id=${fromMembershipId}`,
        request
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: choreSwapKeys.byUser(variables.fromMembershipId),
      });
      queryClient.invalidateQueries({
        queryKey: choreSwapKeys.pending(variables.request.toMembership),
      });
    },
  });
};

export const useSwapRequestsByUserQuery = (membershipId: number) => {
  return useQuery({
    queryKey: choreSwapKeys.byUser(membershipId),
    queryFn: async (): Promise<ChoreSwapRequest[]> => {
      const res = await axiosClient.get(`/api/chore-swap/user/${membershipId}`);
      return res.data;
    },
    enabled: !!membershipId && membershipId > 0,
  });
};

export const usePendingSwapRequestsQuery = (membershipId: number) => {
  return useQuery({
    queryKey: choreSwapKeys.pending(membershipId),
    queryFn: async (): Promise<ChoreSwapRequest[]> => {
      const res = await axiosClient.get(
        `/api/chore-swap/pending/${membershipId}`
      );
      return res.data;
    },
    enabled: !!membershipId && membershipId > 0,
    staleTime: 0, // Always refetch to get latest pending requests
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useSwapRequestsByRoomQuery = (roomId: number) => {
  return useQuery({
    queryKey: choreSwapKeys.byRoom(roomId),
    queryFn: async (): Promise<ChoreSwapRequest[]> => {
      const res = await axiosClient.get(`/api/chore-swap/room/${roomId}`);
      return res.data;
    },
    enabled: !!roomId && roomId > 0,
    staleTime: 0, // Always refetch to get latest swap requests
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useRespondToSwapRequestMutation = () => {
  return useMutation({
    mutationFn: async ({
      swapId,
      response,
    }: {
      swapId: number;
      response: ChoreSwapRequestResponseRequest;
    }) => {
      const res = await axiosClient.put(
        `/api/chore-swap/${swapId}/respond`,
        response
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: choreSwapKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["chores"],
      });
    },
  });
};

export const useCancelSwapRequestMutation = () => {
  return useMutation({
    mutationFn: async ({
      swapId,
      membershipId,
    }: {
      swapId: number;
      membershipId: number;
    }) => {
      const res = await axiosClient.delete(
        `/api/chore-swap/${swapId}/cancel?membership_id=${membershipId}`
      );
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all swap request queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: choreSwapKeys.all,
      });
    },
  });
};

export const useSwapRequestByIdQuery = (swapId: number) => {
  return useQuery({
    queryKey: choreSwapKeys.byId(swapId),
    queryFn: async (): Promise<ChoreSwapRequest> => {
      const res = await axiosClient.get(`/api/chore-swap/${swapId}`);
      return res.data;
    },
    enabled: !!swapId && swapId > 0,
  });
};
