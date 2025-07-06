import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/utils/axiosClient";
import { Role, MembershipCreateRequest, RoomMember } from "@/models/Membership";
import { camel_to_snake_serializing_date } from "@/utils/apiMapper";
import { getQueryClient } from "@/services/queryClient";

const queryClient = getQueryClient();

export const membershipKeys = {
  all: ["membership"] as const,
  byUserAndRoom: (userId: number, roomId: number) =>
    [...membershipKeys.all, userId, roomId] as const,
  roleByUserAndRoom: (userId: number, roomId: number) =>
    [...membershipKeys.all, "role", userId, roomId] as const,
  adminCheck: (userId: number, roomId: number) =>
    [...membershipKeys.all, "admin", userId, roomId] as const,
  roomMembers: (roomId: string) =>
    [...membershipKeys.all, "members", roomId] as const,
};

export const useMembershipQuery = (
  userId: number,
  roomId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: membershipKeys.byUserAndRoom(userId, roomId),
    queryFn: async (): Promise<{ membershipId: number; role: string }> => {
      const res = await axiosClient.get(
        `/api/membership/user/${userId}/room/${roomId}`,
        {
          params: { user_id: userId, room_id: roomId },
        }
      );
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!userId && !!roomId && roomId > 0,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useUserRoleQuery = (
  userId: number,
  roomId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: membershipKeys.roleByUserAndRoom(userId, roomId),
    queryFn: async (): Promise<{
      userId: number;
      roomId: number;
      role: string;
    }> => {
      const res = await axiosClient.get(
        `/api/membership/user/${userId}/room/${roomId}/role`
      );
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!userId && !!roomId && roomId > 0,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useIsAdminQuery = (
  userId: number,
  roomId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: membershipKeys.adminCheck(userId, roomId),
    queryFn: async (): Promise<{
      userId: number;
      roomId: number;
      isAdmin: boolean;
    }> => {
      const res = await axiosClient.get(
        `/api/membership/user/${userId}/room/${roomId}/is-admin`
      );
      return res.data;
    },
    enabled: (options?.enabled ?? true) && !!userId && !!roomId && roomId > 0,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

export const useRoomMembersQuery = (roomId: string) => {
  return useQuery({
    queryKey: membershipKeys.roomMembers(roomId),
    queryFn: async (): Promise<
      { userId: number; name: string; membershipId: number; role: string }[]
    > => {
      const res = await axiosClient.get(`/api/membership/${roomId}/members`);
      return res.data;
    },
    enabled: !!roomId && roomId !== "",
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateMembershipMutation = () =>
  useMutation({
    mutationFn: async (
      data: MembershipCreateRequest
    ): Promise<{ membershipId: number; role: string }> => {
      const body = camel_to_snake_serializing_date(data);
      const res = await axiosClient.post("/api/membership/create", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });

export const useJoinRoomByCodeMutation = () =>
  useMutation({
    mutationFn: async (data: {
      userId: number;
      roomCode: string;
    }): Promise<{
      membershipId: number;
      role: string;
      roomId: number;
      message: string;
    }> => {
      const res = await axiosClient.post(
        `/api/membership/join-by-code?user_id=${data.userId}&room_code=${data.roomCode}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

export const useUpdateUserRoleMutation = () =>
  useMutation({
    mutationFn: async (data: {
      userId: number;
      roomId: number;
      newRole: Role;
      adminUserId: number;
    }): Promise<{ userId: number; roomId: number; newRole: string }> => {
      const { userId, roomId, newRole, adminUserId } = data;
      const url = `/api/membership/user/${userId}/room/${roomId}/role?admin_user_id=${adminUserId}&new_role=${newRole}`;

      const res = await axiosClient.put(url);
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: membershipKeys.all,
      });

      await queryClient.invalidateQueries({
        queryKey: membershipKeys.byUserAndRoom(
          variables.userId,
          variables.roomId
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: membershipKeys.roleByUserAndRoom(
          variables.userId,
          variables.roomId
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: membershipKeys.adminCheck(variables.userId, variables.roomId),
      });
      await queryClient.invalidateQueries({
        queryKey: membershipKeys.roomMembers(variables.roomId.toString()),
      });

      await queryClient.refetchQueries({
        queryKey: membershipKeys.roomMembers(variables.roomId.toString()),
      });
    },
  });

export const useLeaveRoomMutation = () =>
  useMutation({
    mutationFn: async (data: {
      membershipId: number;
      roomId: number;
    }): Promise<{
      leftRoom: boolean;
      roomDeleted: boolean;
      membershipId: number;
      message: string;
    }> => {
      const res = await axiosClient.post(
        `/api/membership/leave-room?membership_id=${data.membershipId}&room_id=${data.roomId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

export const useRemoveUserMutation = () =>
  useMutation({
    mutationFn: async (data: {
      adminMembershipId: number;
      targetMembershipId: number;
      roomId: number;
    }): Promise<{
      success: boolean;
      roomDeleted: boolean;
      targetName: string;
      message: string;
    }> => {
      const res = await axiosClient.post(
        `/api/membership/remove-user?admin_membership_id=${data.adminMembershipId}&target_membership_id=${data.targetMembershipId}&room_id=${data.roomId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
