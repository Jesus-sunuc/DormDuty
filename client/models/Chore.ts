export interface Chore {
  choreId: number;
  roomId: number;
  name: string;
  frequency: string;
  frequencyValue?: number;
  dayOfWeek?: number;
  timing?: string;
  description?: string;
  startDate?: string;
  lastCompleted?: string;
  assignedTo?: number;
  assignedMemberIds?: string;
  assignedMemberNames?: string;
  approvalRequired: boolean;
  photoRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChoreCreateRequest {
  roomId: number;
  name: string;
  frequency: string;
  frequencyValue?: number;
  dayOfWeek?: number;
  timing?: string;
  description?: string;
  startDate?: string;
  assignedTo?: number;
  assignedMemberIds?: number[];
  approvalRequired?: boolean;
  photoRequired?: boolean;
  isActive?: boolean;
}

export interface ChoreCompletion {
  completionId: number;
  choreId: number;
  membershipId: number;
  completedAt: string;
  photoUrl?: string;
  status: "pending" | "approved" | "rejected";
  pointsEarned: number;
  createdAt: string;
}

export interface ChoreCompletionCreateRequest {
  choreId: number;
  photoUrl?: string;
}

export interface ChoreVerification {
  verificationId: number;
  completionId: number;
  verifiedBy: number;
  verificationType: "approved" | "rejected";
  comment?: string;
  verifiedAt: string;
}

export interface ChoreVerificationCreateRequest {
  completionId: number;
  verificationType: "approved" | "rejected";
  comment?: string;
}

export interface ChoreWithCompletionStatus extends Chore {
  pendingCompletion?: ChoreCompletion;
  isDue: boolean;
  isOverdue?: boolean;
  daysUntilDue?: number;
}
