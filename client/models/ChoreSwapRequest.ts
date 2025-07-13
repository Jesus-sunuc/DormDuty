export interface ChoreSwapRequest {
  swapId: number;
  choreId: number;
  choreName: string;
  fromMembership: number;
  fromUserName: string;
  toMembership: number;
  toUserName: string;
  status: "pending" | "accepted" | "declined";
  message?: string;
  requestedAt: string;
  respondedAt?: string;
}

export interface ChoreSwapRequestCreateRequest {
  choreId: number;
  toMembership: number;
  message?: string;
}

export interface ChoreSwapRequestResponseRequest {
  status: "accepted" | "declined";
}
