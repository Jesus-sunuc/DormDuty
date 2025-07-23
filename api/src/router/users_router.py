from src.features.settings import IS_DEV
from src.errors import error_handler
from src.repository.users_repository import UserRepository
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Users endpoint not found"}},
)

class UpdateFirebaseUidRequest(BaseModel):
    fb_uid: str

class CreateUserRequest(BaseModel):
    fb_uid: str
    email: str
    name: str
    avatar_url: str = None

repo = UserRepository()

@router.get("/all")
@error_handler("Error fetching all users")
def get_all_users():
    if not IS_DEV:
        raise PermissionError("This endpoint is only available in development mode.")
    return repo.get_all_users()

@router.get("/firebase/{fb_uid}")
@error_handler("Error fetching user by Firebase UID")
def get_user_by_firebase_uid(fb_uid: str):
    user = repo.get_user_by_firebase_uid(fb_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/email/{email}")
@error_handler("Error fetching user by email")
def get_user_by_email(email: str):
    user = repo.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/firebase-uid/{user_id}")
@error_handler("Error updating Firebase UID")
def update_user_firebase_uid(user_id: int, request: UpdateFirebaseUidRequest):
    user = repo.update_user_firebase_uid(user_id, request.fb_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/")
@error_handler("Error creating user")
def create_user(user_data: CreateUserRequest):
    return repo.create_user(
        fb_uid=user_data.fb_uid,
        email=user_data.email,
        name=user_data.name,
        avatar_url=user_data.avatar_url
    )