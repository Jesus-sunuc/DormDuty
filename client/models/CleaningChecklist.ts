export interface CleaningChecklist {
  checklistItemId: number;
  roomId: number;
  title: string;
  description?: string;
  isDefault: boolean;
}

export interface CleaningChecklistCreateRequest {
  room_id: number;
  title: string;
  description?: string;
  is_default?: boolean;
}

export interface CleaningChecklistUpdateRequest {
  title?: string;
  description?: string;
}

export interface CleaningCheckStatus {
  statusId: number;
  checklistItemId: number;
  membershipId: number;
  markedDate: string; // YYYY-MM-DD format
  isCompleted: boolean;
  updatedAt: string;
}

export interface CleaningCheckStatusCreateRequest {
  checklist_item_id: number;
  membership_id: number;
  marked_date: string; // YYYY-MM-DD format
  is_completed?: boolean;
}

export interface CleaningChecklistWithStatus {
  checklistItemId: number;
  roomId: number;
  title: string;
  description?: string;
  isDefault: boolean;
  assignedTo?: string;
  assignedMembershipIds?: string; // Comma-separated string of membership IDs
  isCompleted: boolean;
  statusId?: number;
}
