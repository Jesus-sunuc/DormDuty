from fastapi import APIRouter, Path
from src.repository.chores_repository import ChoreRepository
from src.errors import error_handler

router = APIRouter(
    prefix="/chores",
    tags=["Chores"],
    responses={404: {"description": "Chores endpoint not found"}},
)

repo = ChoreRepository()

@router.get("/all")
@error_handler("Error fetching all chores")
def get_chores():
    return repo.get_all_chores()

@router.get("/by-room/{room_id}")
@error_handler("Error fetching chores by room")
def get_chores_by_room(room_id: int = Path(..., title="Room ID")):
    return repo.get_chores_by_room_id(room_id)

