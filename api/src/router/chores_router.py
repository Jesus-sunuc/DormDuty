from src.models.chore import ChoreCreateRequest
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

@router.get("/by-user/{user_id}")
@error_handler("Error fetching chores by user")
def get_chores_by_user(user_id: int):
    return repo.get_chores_by_user_id(user_id)

@router.get("/assigned-to-user/{user_id}")
@error_handler("Error fetching chores assigned to user")
def get_chores_assigned_to_user(user_id: int):
    return repo.get_chores_assigned_to_user(user_id)

@router.get("/by-room/{room_id}")
@error_handler("Error fetching chores by room")
def get_chores_by_room(room_id: int):
    return repo.get_chores_by_room_id(room_id)

@router.get("/{chore_id}")
@error_handler("Error fetching chore by ID")
def get_chore(chore_id: int):
    return repo.get_chore_by_id(chore_id)

@router.post("/add")
@error_handler("Error adding chore")
def add_chore(chore: ChoreCreateRequest):
    return repo.add_chore(chore)

@router.put("/{chore_id}/update")
@error_handler("Error updating chore")
def update_chore(chore_id: int, chore: ChoreCreateRequest):
    return repo.update_chore(chore_id, chore)

@router.post("/{chore_id}/delete")
@error_handler("Error deleting chore")
def delete_chore(chore_id: int):
    return repo.delete_chore(chore_id)