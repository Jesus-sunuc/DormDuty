from pydantic import BaseModel
from datetime import datetime

class AnnouncementCreateRequest(BaseModel):
    room_id: int
    message: str
    can_reply: bool = False

class Announcement(BaseModel):
    announcement_id: int
    room_id: int
    created_by: int
    message: str
    can_reply: bool
    created_at: datetime

class AnnouncementResponse(BaseModel):
    announcement_id: int
    room_id: int
    created_by: int
    message: str
    can_reply: bool
    created_at: datetime
    member_name: str  # Joined from user table
