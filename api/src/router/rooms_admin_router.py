from src.repository.rooms_admin_repository import RoomAdminRepository
from src.models.room import RoomCreateRequest, RoomUpdateRequest
from fastapi import APIRouter
from src.errors import error_handler

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms Admin"],
    responses={404: {"description": "Room admin endpoint not found"}},
)

@router.post("/admin/add_room")
@error_handler("Error creating room")
def add_room_admin(room: RoomCreateRequest):
    repo = RoomAdminRepository()
    return repo.add_room(room)

@router.put("/admin/update_room")
@error_handler("Error updating room")
def update_room_admin(room: RoomUpdateRequest):
    repo = RoomAdminRepository()
    return repo.update_room(room)