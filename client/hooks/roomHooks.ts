import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import {
  Room,
  RoomCreateRequest,
  RoomCreateResponse,
  RoomUpdateRequest,
} from "@/models/Room";
import { camel_to_snake_serializing_date } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";

const queryClient = getQueryClient();

export const roomKeys = {
  all: ["rooms"] as const,
  byUser: (userId: number) => ["rooms", "by-user", userId] as const,
  byId: (roomId: number) => ["rooms", "by-id", roomId] as const,
};

export const useRoomsQuery = () => {
  return useQuery({
    queryKey: roomKeys.all,
    queryFn: async (): Promise<Room[]> => {
      const res = await axiosClient.get("/api/rooms/all");
      return res.data;
    },
  });
};

export const useRoomsByUserQuery = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  return useQuery({
    queryKey: ["rooms", "by-user", userId],
    queryFn: async (): Promise<Room[]> => {
      if (!userId) {
        console.log("No userId available, returning empty rooms array");
        return [];
      }

      try {
        const res = await axiosClient.get(`/api/rooms/by-user/${userId}`);
        return res.data;
      } catch (error) {
        console.error("Failed to fetch rooms for user:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: !!userId ? 5 * 60 * 1000 : 0,
    refetchOnMount: true,
  });
};

export const useRoomByIdQuery = (roomId: number) => {
  return useQuery({
    queryKey: roomKeys.byId(roomId),
    queryFn: async (): Promise<Room> => {
      const res = await axiosClient.get(`/api/rooms/${roomId}`);
      return res.data;
    },
    enabled: !!roomId && roomId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddRoomMutation = () =>
  useMutation({
    mutationFn: async (
      data: RoomCreateRequest
    ): Promise<RoomCreateResponse> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post("/api/rooms/admin/add_room", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.invalidateQueries({ queryKey: ["membership"] });
    },
  });

export const useUpdateRoomMutation = () =>
  useMutation({
    mutationFn: async (data: RoomUpdateRequest): Promise<Room> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.put("/api/rooms/admin/update_room", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
