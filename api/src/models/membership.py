from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class Membership(BaseModel):
    membership_id: int
    user_id: int
    room_id: int
    role: Role
    joined_at: datetime
    is_active: bool = True

class MembershipCreateRequest(BaseModel):
    user_id: int
    room_id: int
    role: Role = Role.MEMBER
