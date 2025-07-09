from fastapi import APIRouter, HTTPException, status, Query
from src.repository.announcement_repository import AnnouncementRepository
from src.repository.membership_repository import MembershipRepository
from src.models.announcement import AnnouncementCreate, AnnouncementResponse
from src.errors import error_handler
from typing import List

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
    responses={404: {"description": "Announcement endpoint not found"}},
)

repo = AnnouncementRepository()
membership_repo = MembershipRepository()


@router.get("/room/{room_id}", response_model=List[AnnouncementResponse])
@error_handler("Error fetching room announcements")
def get_room_announcements(room_id: int):
    return repo.get_announcements_by_room(room_id)


@router.post("/create", response_model=AnnouncementResponse)
@error_handler("Error creating announcement")
def create_announcement(
    announcement: AnnouncementCreate,
    user_id: int = Query(..., description="User ID from authentication")
):
    membership = membership_repo.get_membership_by_user_and_room(user_id, announcement.room_id)
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    return repo.create_announcement(announcement, membership["membership_id"])


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
@error_handler("Error fetching announcement")
def get_announcement_by_id(announcement_id: int):
    announcement = repo.get_announcement_by_id(announcement_id)
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    return announcement


@router.delete("/{announcement_id}")
@error_handler("Error deleting announcement")
def delete_announcement(
    announcement_id: int,
    user_id: int = Query(..., description="User ID from authentication")
):
    announcement = repo.get_announcement_by_id(announcement_id)
    
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    membership = membership_repo.get_membership_by_user_and_room(user_id, announcement.room_id)
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    deleted = repo.delete_announcement(announcement_id, membership["membership_id"])
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own announcements"
        )
    
    return {"message": "Announcement deleted successfully"}
