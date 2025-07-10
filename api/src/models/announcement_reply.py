from pydantic import BaseModel
from datetime import datetime

class AnnouncementReplyCreateRequest(BaseModel):
    announcement_id: int
    message: str

class AnnouncementReply(BaseModel):
    reply_id: int
    announcement_id: int
    membership_id: int
    message: str
    replied_at: datetime

class AnnouncementReplyResponse(BaseModel):
    reply_id: int
    announcement_id: int
    membership_id: int
    message: str
    replied_at: datetime
    member_name: str
