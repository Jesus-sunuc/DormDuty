from datetime import datetime
from pydantic import BaseModel

class Room(BaseModel):
    room_id: int
    room_code: str
    created_by: int
    name: str
    created_at: datetime
    updated_at: datetime