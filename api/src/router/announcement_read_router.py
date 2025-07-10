from fastapi import APIRouter, Query, HTTPException
from src.models.announcement_read import AnnouncementReadCreateRequest, AnnouncementReadResponse
from src.repository.announcement_read_repository import AnnouncementReadRepository
from typing import List

router = APIRouter()
read_repository = AnnouncementReadRepository()

@router.post("/announcements/{announcement_id}/read", response_model=AnnouncementReadResponse)
def mark_announcement_as_read(
    announcement_id: int,
    user_id: int = Query(..., description="User ID to get membership")
):
    """Mark an announcement as read by the user"""
    try:
        # We need to get the membership_id from user_id and announcement's room
        # First, get the room_id from the announcement
        from src.repository.announcement_repository import AnnouncementRepository
        announcement_repo = AnnouncementRepository()
        announcement = announcement_repo.get_announcement_by_id(announcement_id)
        
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        # Get membership_id
        from src.repository.membership_repository import MembershipRepository
        membership_repo = MembershipRepository()
        membership = membership_repo.get_membership_by_user_and_room(user_id, announcement.room_id)
        
        if not membership:
            raise HTTPException(status_code=403, detail="User not a member of this room")
        
        result = read_repository.mark_as_read(announcement_id, membership["membership_id"])
        
        if not result:
            raise HTTPException(status_code=500, detail="Failed to mark as read")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/announcements/{announcement_id}/readers", response_model=List[AnnouncementReadResponse])
def get_announcement_readers(announcement_id: int):
    """Get all users who have read an announcement"""
    try:
        return read_repository.get_readers_by_announcement(announcement_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/announcements/{announcement_id}/read-status")
def check_read_status(
    announcement_id: int,
    user_id: int = Query(..., description="User ID to check read status")
):
    """Check if an announcement has been read by the user"""
    try:
        # Get membership_id
        from src.repository.announcement_repository import AnnouncementRepository
        from src.repository.membership_repository import MembershipRepository
        
        announcement_repo = AnnouncementRepository()
        announcement = announcement_repo.get_announcement_by_id(announcement_id)
        
        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        membership_repo = MembershipRepository()
        membership = membership_repo.get_membership_by_user_and_room(user_id, announcement.room_id)
        
        if not membership:
            raise HTTPException(status_code=403, detail="User not a member of this room")
        
        is_read = read_repository.is_read_by_user(announcement_id, membership["membership_id"])
        
        return {"is_read": is_read}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms/{room_id}/unread-announcements")
def get_unread_announcements(
    room_id: int,
    user_id: int = Query(..., description="User ID to get unread announcements")
):
    """Get announcement IDs that haven't been read by the user"""
    try:
        # Get membership_id
        from src.repository.membership_repository import MembershipRepository
        membership_repo = MembershipRepository()
        membership = membership_repo.get_membership_by_user_and_room(user_id, room_id)
        
        if not membership:
            raise HTTPException(status_code=403, detail="User not a member of this room")
        
        unread_ids = read_repository.get_unread_announcements_for_user(room_id, membership["membership_id"])
        
        return {"unread_announcement_ids": unread_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
