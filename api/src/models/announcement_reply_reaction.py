from pydantic import BaseModel
from datetime import datetime

class AnnouncementReplyReactionCreateRequest(BaseModel):
    reply_id: int
    emoji: str

class AnnouncementReplyReaction(BaseModel):
    reaction_id: int
    reply_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime

class AnnouncementReplyReactionResponse(BaseModel):
    reaction_id: int
    reply_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime
    member_name: str
