import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Chore } from "@/models/Chore";

export function useChores() {
  return useQuery<Chore[]>({
    queryKey: ["chores"],
    queryFn: async () => {
      const res = await axiosClient.get("/api/chores/all");
      return res.data;
    },
  });
}
