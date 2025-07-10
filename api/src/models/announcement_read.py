from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AnnouncementReadCreateRequest(BaseModel):
    announcement_id: int = Field(..., description="ID of the announcement that was read")

class AnnouncementReadResponse(BaseModel):
    read_id: int
    announcement_id: int
    membership_id: int
    read_at: datetime
    member_name: str

    class Config:
        from_attributes = True
