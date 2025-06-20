from datetime import datetime, time
from pydantic import BaseModel

class Chore(BaseModel):
    chore_id: int
    room_id: int
    name: str
    frequency: str
    frequency_value: int | None = None
    day_of_week: int | None = None
    timing: time | None = None
    last_completed: datetime | None = None
    assigned_to: int | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime