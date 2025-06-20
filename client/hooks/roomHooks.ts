import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Room } from "@/models/Room";

export const roomKeys = {
  all: ["rooms"] as const,
};

export function useRoomsQuery() {
  return useSuspenseQuery({
    queryKey: roomKeys.all,
    queryFn: async (): Promise<Room[]> => {
      const res = await axiosClient.get("/api/rooms/all");
      return res.data;
    },
  });
}

// export function useCreateRoomMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (name: string) => {
//       const res = await axiosClient.post("/api/rooms/create", { name });
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: roomKeys.all });
//     },
//   });
// }
