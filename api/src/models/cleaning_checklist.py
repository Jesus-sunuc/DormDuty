from datetime import datetime
from pydantic import BaseModel

class CleaningChecklist(BaseModel):
    checklist_item_id: int
    room_id: int
    title: str
    description: str | None = None
    is_default: bool

class CleaningChecklistCreateRequest(BaseModel):
    room_id: int
    title: str
    description: str | None = None
    is_default: bool = False

class CleaningChecklistUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None

class CleaningCheckStatus(BaseModel):
    status_id: int
    checklist_item_id: int
    membership_id: int
    marked_date: datetime
    is_completed: bool
    updated_at: datetime

class CleaningCheckStatusCreateRequest(BaseModel):
    checklist_item_id: int
    membership_id: int
    marked_date: str  # YYYY-MM-DD format
    is_completed: bool = False

class CleaningCheckStatusUnassignRequest(BaseModel):
    checklist_item_id: int
    marked_date: str  # YYYY-MM-DD format

class CleaningChecklistWithStatus(BaseModel):
    checklist_item_id: int
    room_id: int
    title: str
    description: str | None = None
    is_default: bool
    assigned_to: str | None = None
    assigned_membership_ids: str | None = None
    is_completed: bool = False
    status_id: int | None = None
