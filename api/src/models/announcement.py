from pydantic import BaseModel
from datetime import datetime


class AnnouncementBase(BaseModel):
    message: str
    can_reply: bool = False


class AnnouncementCreate(AnnouncementBase):
    room_id: int


class AnnouncementResponse(AnnouncementBase):
    announcement_id: int
    room_id: int
    created_by: int
    created_at: datetime
    member_name: str  # Joined from user table
    can_reply: bool

    class Config:
        from_attributes = True


class AnnouncementWithReactions(AnnouncementResponse):
    reaction_count: int = 0
    user_reacted: bool = False
