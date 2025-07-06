from fastapi import APIRouter, Query, HTTPException, status
from src.repository.membership_repository import MembershipRepository
from src.models.membership import Role, MembershipCreateRequest
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
    membership = repo.get_membership_by_user_and_room(user_id=user_id, room_id=room_id)
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} is not a member of room {room_id}"
        )
    return membership

@router.get("/user/{user_id}/room/{room_id}/role")
@error_handler("Error fetching user role")
def get_user_role(user_id: int, room_id: int):
    role = repo.get_user_role(user_id=user_id, room_id=room_id)
    return {"user_id": user_id, "room_id": room_id, "role": role}

@router.get("/user/{user_id}/room/{room_id}/is-admin")
@error_handler("Error checking admin status")
def check_admin_status(user_id: int, room_id: int):
    is_admin = repo.is_admin(user_id=user_id, room_id=room_id)
    return {"user_id": user_id, "room_id": room_id, "is_admin": is_admin}

@router.post("/create")
@error_handler("Error creating membership")
def create_membership(membership: MembershipCreateRequest):
    return repo.create_membership(membership)

@router.post("/join-by-code")
@error_handler("Error joining room by code")
def join_room_by_code(user_id: int = Query(..., description="User ID joining the room"), 
                      room_code: str = Query(..., description="Room code to join")):
    return repo.join_room_by_code(user_id=user_id, room_code=room_code)

@router.put("/user/{user_id}/room/{room_id}/role")
@error_handler("Error updating user role")
def update_user_role(user_id: int, room_id: int, new_role: Role, admin_user_id: int = Query(..., description="ID of admin making the change")):
    if not repo.is_admin(admin_user_id, room_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to change user roles"
        )
    
    return repo.update_user_role(user_id, room_id, new_role)

@router.get("/{room_id}/members")
@error_handler("Error fetching room members")
def get_members(room_id: int):
    return repo.get_members_by_room_id(room_id)