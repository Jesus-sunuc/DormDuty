from fastapi import APIRouter, HTTPException, status, Query
from src.repository.announcement_reply_reaction_repository import AnnouncementReplyReactionRepository
from src.repository.membership_repository import MembershipRepository
from src.repository.announcement_reply_repository import AnnouncementReplyRepository
from src.models.announcement_reply_reaction import AnnouncementReplyReactionCreateRequest, AnnouncementReplyReactionResponse
from src.errors import error_handler
from typing import List

router = APIRouter(
    prefix="/announcement-reply-reactions",
    tags=["Announcement Reply Reactions"],
    responses={404: {"description": "Announcement reply reaction endpoint not found"}},
)

repo = AnnouncementReplyReactionRepository()
membership_repo = MembershipRepository()
reply_repo = AnnouncementReplyRepository()

@router.get("/reply/{reply_id}", response_model=List[AnnouncementReplyReactionResponse])
@error_handler("Error fetching reply reactions")
def get_reactions_by_reply(reply_id: int):
    return repo.get_reactions_by_reply(reply_id)

@router.post("/create", response_model=AnnouncementReplyReactionResponse)
@error_handler("Error creating reply reaction")
def create_reply_reaction(
    reaction: AnnouncementReplyReactionCreateRequest,
    user_id: int = Query(..., description="User ID from authentication")
):
    # Get the reply to find the room
    from src.services.database.helper import run_sql
    sql = """
        SELECT ar.announcement_id, a.room_id 
        FROM announcement_reply ar
        JOIN announcement a ON ar.announcement_id = a.announcement_id
        WHERE ar.reply_id = %s
    """
    result = run_sql(sql, [reaction.reply_id])
    if not result:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    room_id = result[0][1]
    membership = membership_repo.get_membership_by_user_and_room(user_id, room_id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    return repo.update_or_create_reaction(reaction, membership["membership_id"])

@router.delete("/reply/{reply_id}")
@error_handler("Error removing user reply reaction")
def remove_user_reply_reaction(
    reply_id: int,
    user_id: int = Query(..., description="User ID from authentication")
):
    # Get the reply to find the room
    from src.services.database.helper import run_sql
    sql = """
        SELECT ar.announcement_id, a.room_id 
        FROM announcement_reply ar
        JOIN announcement a ON ar.announcement_id = a.announcement_id
        WHERE ar.reply_id = %s
    """
    result = run_sql(sql, [reply_id])
    if not result:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    room_id = result[0][1]
    membership = membership_repo.get_membership_by_user_and_room(user_id, room_id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    deleted = repo.delete_user_reaction(reply_id, membership["membership_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reaction found to delete"
        )
    return {"message": "Reply reaction removed successfully"}
