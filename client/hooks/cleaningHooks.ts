import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import {
  CleaningChecklistCreateRequest,
  CleaningChecklistUpdateRequest,
  CleaningCheckStatus,
  CleaningChecklistWithStatus,
} from "@/models/CleaningChecklist";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const cleaningKeys = {
  all: ["cleaning"] as const,
  byRoom: (roomId: number, date?: string) =>
    [...cleaningKeys.all, "room", roomId, date] as const,
  status: (roomId: number, startDate: string, endDate: string) =>
    [...cleaningKeys.all, "status", roomId, startDate, endDate] as const,
};

// Checklist Queries
export const useRoomChecklistQuery = (roomId: number, date?: string) => {
  return useQuery({
    queryKey: cleaningKeys.byRoom(roomId, date),
    queryFn: async (): Promise<CleaningChecklistWithStatus[]> => {
      const params = date ? `?date_filter=${date}` : "";
      const res = await axiosClient.get(
        `/api/cleaning/room/${roomId}${params}`
      );
      return res.data;
    },
    enabled: !!roomId && roomId > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRoomStatusHistoryQuery = (
  roomId: number,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: cleaningKeys.status(roomId, startDate, endDate),
    queryFn: async (): Promise<CleaningCheckStatus[]> => {
      const res = await axiosClient.get(
        `/api/cleaning/status/room/${roomId}?start_date=${startDate}&end_date=${endDate}`
      );
      return res.data;
    },
    enabled: !!roomId && roomId > 0 && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000,
  });
};

// Checklist Mutations
export const useCreateChecklistItemMutation = () => {
  return useMutation({
    mutationFn: async (item: CleaningChecklistCreateRequest) => {
      const res = await axiosClient.post("/api/cleaning/add", item);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cleaningKeys.byRoom(variables.room_id),
      });
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useUpdateChecklistItemMutation = () => {
  return useMutation({
    mutationFn: async ({
      checklistItemId,
      update,
    }: {
      checklistItemId: number;
      update: CleaningChecklistUpdateRequest;
    }) => {
      const res = await axiosClient.put(
        `/api/cleaning/${checklistItemId}/update`,
        update
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useDeleteChecklistItemMutation = () => {
  return useMutation({
    mutationFn: async (checklistItemId: number) => {
      const res = await axiosClient.post(
        `/api/cleaning/${checklistItemId}/delete`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useInitializeRoomChecklistMutation = () => {
  return useMutation({
    mutationFn: async (roomId: number) => {
      const res = await axiosClient.post(
        `/api/cleaning/room/${roomId}/initialize`
      );
      return res.data;
    },
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({
        queryKey: cleaningKeys.byRoom(roomId),
      });
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

// Status Mutations
export const useAssignTaskMutation = () => {
  return useMutation({
    mutationFn: async ({
      checklistItemId,
      membershipId,
      markedDate,
    }: {
      checklistItemId: number;
      membershipId: number;
      markedDate: string;
    }) => {
      const res = await axiosClient.post(
        `/api/cleaning/assign?checklist_item_id=${checklistItemId}&membership_id=${membershipId}&marked_date=${markedDate}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useToggleTaskCompletionMutation = () => {
  return useMutation({
    mutationFn: async ({
      checklistItemId,
      membershipId,
      markedDate,
    }: {
      checklistItemId: number;
      membershipId: number;
      markedDate: string;
    }) => {
      const res = await axiosClient.post(
        `/api/cleaning/toggle?checklist_item_id=${checklistItemId}&membership_id=${membershipId}&marked_date=${markedDate}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useCompleteTaskMutation = () => {
  return useMutation({
    mutationFn: async ({
      checklistItemId,
      membershipId,
      markedDate,
    }: {
      checklistItemId: number;
      membershipId: number;
      markedDate: string;
    }) => {
      const res = await axiosClient.post(
        `/api/cleaning/complete?checklist_item_id=${checklistItemId}&membership_id=${membershipId}&marked_date=${markedDate}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};

export const useResetRoomTasksMutation = () => {
  return useMutation({
    mutationFn: async ({
      roomId,
      markedDate,
    }: {
      roomId: number;
      markedDate: string;
    }) => {
      const res = await axiosClient.post(
        `/api/cleaning/room/${roomId}/reset?marked_date=${markedDate}`
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cleaningKeys.byRoom(variables.roomId),
      });
      queryClient.invalidateQueries({ queryKey: cleaningKeys.all });
    },
  });
};
