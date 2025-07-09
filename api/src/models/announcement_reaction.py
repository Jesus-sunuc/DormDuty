from pydantic import BaseModel
from datetime import datetime

class AnnouncementReactionBase(BaseModel):
    emoji: str

class AnnouncementReactionCreate(AnnouncementReactionBase):
    announcement_id: int

class AnnouncementReactionResponse(AnnouncementReactionBase):
    reaction_id: int
    announcement_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime
    member_name: str

    class Config:
        from_attributes = True
