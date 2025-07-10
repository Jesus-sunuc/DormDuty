from pydantic import BaseModel
from datetime import datetime

class AnnouncementReplyReactionBase(BaseModel):
    emoji: str

class AnnouncementReplyReactionCreate(AnnouncementReplyReactionBase):
    reply_id: int

class AnnouncementReplyReactionResponse(AnnouncementReplyReactionBase):
    reaction_id: int
    reply_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime
    member_name: str

    class Config:
        from_attributes = True
