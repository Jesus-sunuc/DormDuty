from src.models.chore import ChoreCreateRequest, ChoreAssignRequest, ChoreUnassignRequest, ChoreCompletionCreateRequest, ChoreVerificationCreateRequest
from fastapi import APIRouter, Query, HTTPException
from src.repository.chores_repository import ChoreRepository
from src.repository.membership_repository import MembershipRepository
from src.errors import error_handler

router = APIRouter(
    prefix="/chores",
    tags=["Chores"],
    responses={404: {"description": "Chores endpoint not found"}},
)

repo = ChoreRepository()
membership_repo = MembershipRepository()

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

# Chore Completion Endpoints
@router.post("/{chore_id}/complete")
@error_handler("Error completing chore")
def complete_chore(chore_id: int, completion_request: ChoreCompletionCreateRequest, membership_id: int = Query(..., description="ID of the member completing the chore")):
    return repo.create_completion(membership_id, completion_request)

@router.get("/completions/{completion_id}")
@error_handler("Error fetching completion")
def get_completion(completion_id: int):
    return repo.get_completion_by_id(completion_id)

@router.get("/room/{room_id}/pending-completions")
@error_handler("Error fetching pending completions")
def get_pending_completions(room_id: int):
    return repo.get_pending_completions_by_room(room_id)

@router.get("/user/{user_id}/completions")
@error_handler("Error fetching user completions")
def get_user_completions(user_id: int, room_id: int = Query(None, description="Filter by room ID")):
    return repo.get_user_completions(user_id, room_id)

@router.get("/room/{room_id}/with-completion-status")
@error_handler("Error fetching chores with completion status")
def get_chores_with_completion_status(room_id: int, user_id: int = Query(None, description="Filter by user ID")):
    return repo.get_chores_with_completion_status(room_id, user_id)

@router.post("/completions/{completion_id}/verify")
@error_handler("Error verifying completion")
def verify_completion(completion_id: int, verification_request: ChoreVerificationCreateRequest, verified_by_membership_id: int = Query(..., description="ID of the member verifying the completion")):
    membership = membership_repo.get_membership_by_id(verified_by_membership_id)
    if not membership or membership.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Only room admins can verify chore completions")
    
    return repo.create_verification(verified_by_membership_id, verification_request)

@router.get("/completions/{completion_id}/verification")
@error_handler("Error fetching verification details")
def get_verification_details(completion_id: int):
    verification = repo.get_verification_by_completion_id(completion_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found for this completion")
    return verification