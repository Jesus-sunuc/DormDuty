export interface CleaningChecklist {
  checklist_item_id: number;
  room_id: number;
  title: string;
  description?: string;
  is_default: boolean;
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
  status_id: number;
  checklist_item_id: number;
  membership_id: number;
  marked_date: string; // YYYY-MM-DD format
  is_completed: boolean;
  updated_at: string;
}

export interface CleaningCheckStatusCreateRequest {
  checklist_item_id: number;
  membership_id: number;
  marked_date: string; // YYYY-MM-DD format
  is_completed?: boolean;
}

export interface CleaningChecklistWithStatus {
  checklist_item_id: number;
  room_id: number;
  title: string;
  description?: string;
  is_default: boolean;
  assigned_to?: string;
  assigned_membership_id?: number;
  is_completed: boolean;
  status_id?: number;
}
