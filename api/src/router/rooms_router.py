from fastapi import APIRouter
from src.repository.rooms_repository import RoomRepository
from src.errors import error_handler

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
