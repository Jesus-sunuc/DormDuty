from src.repository.rooms_repository import RoomRepository
from src.models.room import RoomCreateRequest, RoomUpdateRequest
from fastapi import APIRouter
from src.errors import error_handler

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms Admin"],
    responses={404: {"description": "Room admin endpoint not found"}},
)

repo = RoomRepository()

@router.get("/all")
@error_handler("Error fetching all rooms")
def get_all_rooms():
    return repo.get_all_rooms()

@router.get("/by-user/{user_id}")
@error_handler("Error fetching rooms by user")
def get_rooms_by_user(user_id: int):
    return repo.get_rooms_by_user_id(user_id)

@router.get("/{room_id}")
@error_handler("Error fetching room by ID")
def get_room_by_id(room_id: int):
    return repo.get_room_by_id(room_id)

@router.post("/admin/add_room")
@error_handler("Error creating room")
def add_room_admin(room: RoomCreateRequest):
    return repo.add_room(room)

@router.put("/admin/update_room")
@error_handler("Error updating room")
def update_room_admin(room: RoomUpdateRequest):
    return repo.update_room(room)

