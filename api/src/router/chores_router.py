from src.models.chore import ChoreCreateRequest, ChoreAssignRequest, ChoreUnassignRequest
from fastapi import APIRouter
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

@router.post("/{chore_id}/assign")
@error_handler("Error assigning chore")
def assign_chore(chore_id: int, request: ChoreAssignRequest):
    repo.assign_multiple_members(chore_id, request.membership_ids)
    return {"message": "Chore assigned successfully"}

@router.post("/{chore_id}/unassign")
@error_handler("Error unassigning chore")
def unassign_chore(chore_id: int, request: ChoreUnassignRequest):
    repo.unassign_chore(chore_id, request.membership_id)
    return {"message": "Chore unassigned successfully"}

@router.get("/{chore_id}/assignments")
@error_handler("Error fetching chore assignments")
def get_chore_assignments(chore_id: int):
    return repo.get_chore_assignments(chore_id)