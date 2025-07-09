from fastapi import APIRouter, HTTPException, status, Query
from src.repository.announcement_reaction_repository import AnnouncementReactionRepository
from src.repository.membership_repository import MembershipRepository
from src.repository.announcement_repository import AnnouncementRepository
from src.models.announcement_reaction import AnnouncementReactionCreate, AnnouncementReactionResponse
from src.errors import error_handler
from typing import List

router = APIRouter(
    prefix="/announcement-reactions",
    tags=["Announcement Reactions"],
    responses={404: {"description": "Announcement reaction endpoint not found"}},
)

repo = AnnouncementReactionRepository()
membership_repo = MembershipRepository()
announcement_repo = AnnouncementRepository()

@router.get("/announcement/{announcement_id}", response_model=List[AnnouncementReactionResponse])
@error_handler("Error fetching announcement reactions")
def get_reactions_by_announcement(announcement_id: int):
    return repo.get_reactions_by_announcement(announcement_id)

@router.post("/create", response_model=AnnouncementReactionResponse)
@error_handler("Error creating reaction")
def create_reaction(
    reaction: AnnouncementReactionCreate,
    user_id: int = Query(..., description="User ID from authentication")
):
    announcement = announcement_repo.get_announcement_by_id(reaction.announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    room_id = announcement.room_id
    membership = membership_repo.get_membership_by_user_and_room(user_id, room_id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    return repo.create_reaction(reaction, membership["membership_id"])

@router.delete("/{reaction_id}")
@error_handler("Error deleting reaction")
def delete_reaction(
    reaction_id: int,
    user_id: int = Query(..., description="User ID from authentication")
):
    from src.services.database.helper import run_sql
    sql = "SELECT announcement_id FROM announcement_reaction WHERE reaction_id = %s"
    result = run_sql(sql, [reaction_id])
    if not result:
        raise HTTPException(status_code=404, detail="Reaction not found")
    announcement_id = result[0][0]
    announcement = announcement_repo.get_announcement_by_id(announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    room_id = announcement.room_id
    membership = membership_repo.get_membership_by_user_and_room(user_id, room_id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    deleted = repo.delete_reaction(reaction_id, membership["membership_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reactions"
        )
    return {"message": "Reaction deleted successfully"}
