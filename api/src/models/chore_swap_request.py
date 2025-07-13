from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ChoreSwapRequest(BaseModel):
    swap_id: int
    chore_id: int
    from_membership: int
    to_membership: int
    status: str  # 'pending', 'accepted', 'declined'
    message: Optional[str] = None
    requested_at: datetime
    responded_at: Optional[datetime] = None

class ChoreSwapRequestWithDetails(BaseModel):
    swap_id: int
    chore_id: int
    chore_name: str
    from_membership: int
    from_user_name: str
    to_membership: int
    to_user_name: str
    status: str
    message: Optional[str] = None
    requested_at: datetime
    responded_at: Optional[datetime] = None

class ChoreSwapRequestCreateRequest(BaseModel):
    chore_id: int
    to_membership: int
    message: Optional[str] = None

class ChoreSwapRequestResponseRequest(BaseModel):
    status: str  # 'accepted' or 'declined'
