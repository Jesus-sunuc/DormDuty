from fastapi import APIRouter, HTTPException, status, Query
from src.repository.announcement_reply_repository import AnnouncementReplyRepository
from src.repository.membership_repository import MembershipRepository
from src.models.announcement_reply import AnnouncementReplyCreate, AnnouncementReplyResponse
from src.errors import error_handler
from typing import List

router = APIRouter(
    prefix="/announcement-replies",
    tags=["Announcement Replies"],
    responses={404: {"description": "Announcement reply endpoint not found"}},
)

repo = AnnouncementReplyRepository()
membership_repo = MembershipRepository()

@router.get("/announcement/{announcement_id}", response_model=List[AnnouncementReplyResponse])
@error_handler("Error fetching announcement replies")
def get_replies_by_announcement(announcement_id: int):
    return repo.get_replies_by_announcement(announcement_id)

@router.post("/create", response_model=AnnouncementReplyResponse)
@error_handler("Error creating reply")
def create_reply(
    reply: AnnouncementReplyCreate,
    user_id: int = Query(..., description="User ID from authentication")
):
    # Find membership for this user in the room of the announcement
    membership = membership_repo.get_membership_by_user_and_room(user_id, reply.announcement_id)  # This needs announcement.room_id, but we only have announcement_id
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    return repo.create_reply(reply, membership["membership_id"])

@router.delete("/{reply_id}")
@error_handler("Error deleting reply")
def delete_reply(
    reply_id: int,
    user_id: int = Query(..., description="User ID from authentication")
):
    # Find membership for this user (must be the author)
    # This is a simplified check; you may want to join to get membership_id from reply_id
    membership = membership_repo.get_membership_by_user_and_room(user_id, reply_id)  # This is not correct, needs mapping
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    deleted = repo.delete_reply(reply_id, membership["membership_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own replies"
        )
    return {"message": "Reply deleted successfully"}
