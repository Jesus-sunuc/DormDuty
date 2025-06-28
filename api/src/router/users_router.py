from src.features.settings import IS_DEV
from src.errors import error_handler
from src.repository.users_repository import UserRepository
from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Users endpoint not found"}},
)

repo = UserRepository()
@router.get("/all")
@error_handler("Error fetching all users")
def get_all_users():
    if not IS_DEV:
        raise PermissionError("This endpoint is only available in development mode.")
    return repo.get_all_users()