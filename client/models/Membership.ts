export enum Role {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface Membership {
  membershipId: number;
  userId: number;
  roomId: number;
  role: Role;
  points: number;
  streakCount: number;
  totalCompleted: number;
  trustScore: number;
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
  points?: number;
  streakCount?: number;
  totalCompleted?: number;
  trustScore?: number;
}

export interface RoomMember {
  userId: number;
  name: string;
  membershipId: number;
  role: Role;
  points: number;
  streakCount: number;
  totalCompleted: number;
  trustScore: number;
  joinedAt: string;
}
