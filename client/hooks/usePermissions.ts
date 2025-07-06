import { useAuth } from "./user/useAuth";
import {
  useIsAdminQuery,
  useUserRoleQuery,
  useMembershipQuery,
} from "./membershipHooks";
import { Role } from "@/models/Membership";

export const usePermissions = (roomId: number) => {
  const { user } = useAuth();
  const userId = user?.userId;

  const {
    data: adminData,
    isLoading: isAdminLoading,
    error: adminError,
  } = useIsAdminQuery(userId!, roomId, {
    enabled: !!userId && !!roomId && roomId > 0,
  });

  const {
    data: roleData,
    isLoading: isRoleLoading,
    error: roleError,
  } = useUserRoleQuery(userId!, roomId, {
    enabled: !!userId && !!roomId && roomId > 0,
  });

  const {
    data: membershipData,
    isLoading: isMembershipLoading,
    error: membershipError,
  } = useMembershipQuery(userId!, roomId, {
    enabled: !!userId && !!roomId && roomId > 0,
  });

  const isNotMember =
    adminError?.response?.status === 404 ||
    roleError?.response?.status === 404 ||
    membershipError?.response?.status === 404;

  return {
    isAdmin: adminData?.isAdmin ?? false,
    isMember: !!membershipData?.membershipId && !isNotMember,
    role: (roleData?.role as Role) || Role.MEMBER,
    membershipId: membershipData?.membershipId,
    membership: membershipData,
    isLoading: isAdminLoading || isRoleLoading || isMembershipLoading,
    error: isNotMember ? null : adminError || roleError || membershipError,
    userId: userId!,
    hasPermission: (requiredRole: Role) => {
      if (!roleData?.role || isNotMember) return false;
      if (requiredRole === Role.ADMIN) {
        return roleData.role === Role.ADMIN;
      }
      return true;
    },
  };
};

export const useIsAdmin = (roomId: number) => {
  const { user } = useAuth();
  const userId = user?.userId;

  const { data, isLoading, error } = useIsAdminQuery(userId!, roomId, {
    enabled: !!userId && !!roomId && roomId > 0,
  });

  return {
    isAdmin: data?.isAdmin ?? false,
    isLoading,
    error,
  };
};

export const useUserRole = (roomId: number) => {
  const { user } = useAuth();
  const userId = user?.userId;

  const { data, isLoading, error } = useUserRoleQuery(userId!, roomId, {
    enabled: !!userId && !!roomId && roomId > 0,
  });

  return {
    role: data?.role as Role,
    isLoading,
    error,
  };
};
