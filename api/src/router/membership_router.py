from fastapi import APIRouter, Query
from src.repository.membership_repository import MembershipRepository
from src.errors import error_handler

router = APIRouter(
    prefix="/membership",
    tags=["Rooms"],
    responses={404: {"description": "Room endpoint not found"}},
)

repo = MembershipRepository()

@router.get("/user/{user_id}/room/{room_id}")
@error_handler("Error fetching room membership")
def get_room_membership(user_id: int, room_id: int):
    repo = MembershipRepository()
    return repo.get_membership_by_user_and_room(user_id=user_id, room_id=room_id)

@router.get("/{room_id}/members")
@error_handler("Error fetching room members")
def get_members(room_id: int):
    return repo.get_members_by_room_id(room_id)