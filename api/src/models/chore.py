from datetime import datetime, time
from pydantic import BaseModel
from typing import List

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
    is_active: bool = True

class ChoreAssignRequest(BaseModel):
    membership_ids: List[int]

class ChoreUnassignRequest(BaseModel):
    membership_id: int | None = None  # If None, unassign all