import { User } from "@/models/User";
import { axiosClient } from "@/utils/axiosClient";
import { useSuspenseQuery } from "@tanstack/react-query";
import { use } from "react";

export const userKeys = {
  all: ["users"] as const,
};

export const useUsersQuery = () => {
  return useSuspenseQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User[]> => {
      const res = await axiosClient.get("/api/users/all");
      return res.data;
    },
  });
};
