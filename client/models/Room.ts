export interface Room {
  roomId: number;
  roomCode: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreateRequest {
  name: string;
  createdBy: number;
}

export interface RoomUpdateRequest {
  roomId: number;
  name: string;
}

export interface RoomDeleteRequest {
  roomId: number;
  membershipId: number;
  isAdmin: boolean;
}
