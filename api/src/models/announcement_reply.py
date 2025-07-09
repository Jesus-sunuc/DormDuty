from pydantic import BaseModel
from datetime import datetime

class AnnouncementReplyBase(BaseModel):
    message: str

class AnnouncementReplyCreate(AnnouncementReplyBase):
    announcement_id: int

class AnnouncementReplyResponse(AnnouncementReplyBase):
    reply_id: int
    announcement_id: int
    membership_id: int
    message: str
    replied_at: datetime
    member_name: str

    class Config:
        from_attributes = True
