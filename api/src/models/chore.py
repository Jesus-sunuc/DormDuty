from datetime import datetime, time
from pydantic import BaseModel
from typing import List, Optional

class Chore(BaseModel):
    chore_id: int
    room_id: int
    name: str
    frequency: str
    frequency_value: int | None = None
    day_of_week: int | None = None
    timing: time | None = None
    description: str | None = None
    start_date: datetime | None = None
    last_completed: datetime | None = None
    assigned_to: int | None = None
    approval_required: bool = False
    photo_required: bool = False
    is_active: bool
    created_at: datetime
    updated_at: datetime

class ChoreWithAssignments(BaseModel):
    chore_id: int
    room_id: int
    name: str
    frequency: str
    frequency_value: int | None = None
    day_of_week: int | None = None
    timing: time | None = None
    description: str | None = None
    start_date: datetime | None = None
    last_completed: datetime | None = None
    assigned_to: int | None = None
    assigned_member_ids: str | None = None
    assigned_member_names: str | None = None
    approval_required: bool = False
    photo_required: bool = False
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
class ChoreCreateRequest(BaseModel):
    room_id: int
    name: str
    frequency: str
    frequency_value: int | None = None
    day_of_week: int | None = None
    timing: time | None = None
    description: str | None = None
    start_date: datetime | None = None
    assigned_to: int | None = None
    assigned_member_ids: List[int] | None = None
    approval_required: bool = False
    photo_required: bool = False
    is_active: bool = True

class ChoreAssignRequest(BaseModel):
    membership_ids: List[int]

class ChoreUnassignRequest(BaseModel):
    membership_id: int | None = None  # If None, unassign all

class ChoreCompletion(BaseModel):
    completion_id: int
    chore_id: int
    membership_id: int
    completed_at: datetime
    photo_url: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    points_earned: int = 0
    created_at: datetime

class ChoreCompletionCreateRequest(BaseModel):
    chore_id: int
    photo_url: Optional[str] = None

class ChoreVerification(BaseModel):
    verification_id: int
    completion_id: int
    verified_by: int
    verification_type: str  # "approved" | "rejected"
    comment: Optional[str] = None
    verified_at: datetime

class ChoreVerificationCreateRequest(BaseModel):
    completion_id: int
    verification_type: str  # "approved" | "rejected"
    comment: Optional[str] = None

class ChoreWithCompletionStatus(BaseModel):
    chore_id: int
    room_id: int
    name: str
    frequency: str
    frequency_value: int | None = None
    day_of_week: int | None = None
    timing: time | None = None
    description: str | None = None
    start_date: datetime | None = None
    last_completed: datetime | None = None
    assigned_to: int | None = None
    assigned_member_ids: str | None = None
    assigned_member_names: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    pending_completion: Optional[ChoreCompletion] = None
    is_due: bool = False
    is_overdue: bool = False
    days_until_due: Optional[int] = None