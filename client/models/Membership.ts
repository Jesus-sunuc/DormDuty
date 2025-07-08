export enum Role {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface Membership {
  membershipId: number;
  userId: number;
  roomId: number;
  role: Role;
  joinedAt: string;
  isActive: boolean;
}

export interface MembershipCreateRequest {
  userId: number;
  roomId: number;
  role?: Role;
}

export interface MembershipUpdateRequest {
  membershipId: number;
  role?: Role;
}

export interface RoomMember {
  userId: number;
  name: string;
  membershipId: number;
  role: Role;
  joinedAt: string;
}
