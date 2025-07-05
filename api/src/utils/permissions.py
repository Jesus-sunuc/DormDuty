from fastapi import HTTPException, status
from src.repository.membership_repository import MembershipRepository

class PermissionValidator:
    def __init__(self):
        self.membership_repo = MembershipRepository()
    
    def require_admin(self, user_id: int, room_id: int):
        if not self.membership_repo.is_admin(user_id, room_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required for this action"
            )
    
    def require_member(self, user_id: int, room_id: int):
        role = self.membership_repo.get_user_role(user_id, room_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Room membership required for this action"
            )
    
    def get_user_membership(self, user_id: int, room_id: int):
        try:
            return self.membership_repo.get_membership_by_user_and_room(user_id, room_id)
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Room membership required for this action"
            )

permission_validator = PermissionValidator()
