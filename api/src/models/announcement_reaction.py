from pydantic import BaseModel
from datetime import datetime

class AnnouncementReactionCreateRequest(BaseModel):
    announcement_id: int
    emoji: str

class AnnouncementReaction(BaseModel):
    reaction_id: int
    announcement_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime

class AnnouncementReactionResponse(BaseModel):
    reaction_id: int
    announcement_id: int
    membership_id: int
    emoji: str
    reacted_at: datetime
    member_name: str
