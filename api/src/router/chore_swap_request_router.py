from fastapi import APIRouter, HTTPException, Query
from src.models.chore_swap_request import (
    ChoreSwapRequestCreateRequest,
    ChoreSwapRequestResponseRequest
)
from src.repository.chore_swap_request_repository import ChoreSwapRequestRepository
from src.errors import error_handler
from typing import Optional

router = APIRouter(
    prefix="/chore-swap",
    tags=["Chore Swap Requests"],
    responses={404: {"description": "Chore swap endpoint not found"}},
)

repo = ChoreSwapRequestRepository()

@router.post("/request")
@error_handler("Error creating swap request")
def create_swap_request(request: ChoreSwapRequestCreateRequest, from_membership_id: int = Query(...)):
    """Create a new chore swap request"""
    return repo.create_swap_request(from_membership_id, request)

@router.get("/user/{membership_id}")
@error_handler("Error fetching swap requests for user")
def get_swap_requests_by_user(membership_id: int):
    """Get all swap requests for a specific user (sent and received)"""
    return repo.get_swap_requests_by_user(membership_id)

@router.get("/pending/{membership_id}")
@error_handler("Error fetching pending swap requests")
def get_pending_requests_for_user(membership_id: int):
    """Get pending swap requests that the user needs to respond to"""
    return repo.get_pending_requests_for_user(membership_id)

@router.get("/room/{room_id}")
@error_handler("Error fetching swap requests for room")
def get_swap_requests_by_room(room_id: int):
    """Get all swap requests for a specific room"""
    return repo.get_swap_requests_by_room(room_id)

@router.put("/{swap_id}/respond")
@error_handler("Error responding to swap request")
def respond_to_swap_request(swap_id: int, response: ChoreSwapRequestResponseRequest):
    """Accept or decline a swap request"""
    if response.status not in ['accepted', 'declined']:
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'declined'")
    
    result = repo.respond_to_swap_request(swap_id, response)
    if not result:
        raise HTTPException(status_code=404, detail="Swap request not found or already responded to")
    
    return result

@router.delete("/{swap_id}/cancel")
@error_handler("Error canceling swap request")
def cancel_swap_request(swap_id: int, membership_id: int = Query(...)):
    """Cancel a pending swap request (only by the requester)"""
    result = repo.cancel_swap_request(swap_id, membership_id)
    if not result:
        raise HTTPException(status_code=404, detail="Swap request not found or cannot be canceled")
    
    return {"message": "Swap request canceled successfully"}

@router.get("/{swap_id}")
@error_handler("Error fetching swap request")
def get_swap_request_by_id(swap_id: int):
    """Get a specific swap request by ID"""
    result = repo.get_swap_request_by_id(swap_id)
    if not result:
        raise HTTPException(status_code=404, detail="Swap request not found")
    
    return result
