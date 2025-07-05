import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import {
  Room,
  RoomCreateRequest,
  RoomCreateResponse,
  RoomDeleteRequest,
  RoomUpdateRequest,
} from "@/models/Room";
import { camel_to_snake_serializing_date } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";
import { useAuth } from "./user/useAuth";

const queryClient = getQueryClient();

export const roomKeys = {
  all: ["rooms"] as const,
  byUser: (userId: number) => ["rooms", "by-user", userId] as const,
};

export const useRoomsQuery = () => {
  return useSuspenseQuery({
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

  return useSuspenseQuery({
    queryKey: ["rooms", "by-user", userId],
    queryFn: async (): Promise<Room[]> => {
      const res = await axiosClient.get(`/api/rooms/by-user/${userId}`);
      return res.data;
    },
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

export const useDeleteRoomMutation = () =>
  useMutation({
    mutationFn: async (data: RoomDeleteRequest) => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post(
        "/api/rooms/admin/delete_room_or_leave",
        body
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
