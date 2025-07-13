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
  isActive?: boolean;
}
