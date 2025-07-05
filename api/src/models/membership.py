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
    points: int = 0
    streak_count: int = 0
    total_completed: int = 0
    trust_score: float = 5.00
    joined_at: datetime
    is_active: bool = True

class MembershipCreateRequest(BaseModel):
    user_id: int
    room_id: int
    role: Role = Role.MEMBER
