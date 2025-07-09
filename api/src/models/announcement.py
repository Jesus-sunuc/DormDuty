from pydantic import BaseModel
from datetime import datetime


class AnnouncementBase(BaseModel):
    message: str


class AnnouncementCreate(AnnouncementBase):
    room_id: int


class AnnouncementResponse(AnnouncementBase):
    announcement_id: int
    room_id: int
    created_by: int
    created_at: datetime
    member_name: str  # Joined from user table
    
    class Config:
        from_attributes = True


class AnnouncementWithReactions(AnnouncementResponse):
    reaction_count: int = 0
    user_reacted: bool = False
