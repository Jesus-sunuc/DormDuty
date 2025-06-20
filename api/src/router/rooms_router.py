from fastapi import APIRouter, Depends, Body
from src.repository.rooms_repository import RoomRepository
from src.errors import error_handler
import uuid

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"],
    responses={404: {"description": "Room endpoint not found"}},
)

repo = RoomRepository()

@router.get("/all")
@error_handler("Error fetching all rooms")
def get_all_rooms():
    return repo.get_all_rooms()

# @router.post("/create")
# @error_handler("Error creating room")
# def create_room(name: str = Body(...), created_by: int = Body(...)):
#     room_code = uuid.uuid4().hex[:6].upper()
#     return repo.create_room(name=name, created_by=created_by, room_code=room_code)
