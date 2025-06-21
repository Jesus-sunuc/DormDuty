import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Room, RoomCreateRequest } from "@/models/Room";
import { camel_to_snake_serializing_date } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const roomKeys = {
  all: ["rooms"] as const,
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

export const useAddRoomMutation = () =>
  useMutation({
    mutationFn: async (
      data: RoomCreateRequest
    ): Promise<{ room_id: number; room_code: string }> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post("/api/rooms/admin/add_room", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
