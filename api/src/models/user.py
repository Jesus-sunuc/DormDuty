from datetime import datetime
from pydantic import BaseModel

class User(BaseModel):
    user_id: int
    fb_uid: str
    name: str
    email: str
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime