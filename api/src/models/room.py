from datetime import datetime
from pydantic import BaseModel

class Room(BaseModel):
    room_id: int
    room_code: str
    created_by: int
    name: str

class RoomCreateRequest(BaseModel):
    name: str
    created_by: int

class RoomUpdateRequest(BaseModel):
    name: str
    room_id: int
    
class RoomDeleteRequest(BaseModel):
    room_id: int
    membership_id: int
    is_admin: bool
