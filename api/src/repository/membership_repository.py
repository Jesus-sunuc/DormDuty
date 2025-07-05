from src.services.database.helper import run_sql
from src.models.membership import Role, MembershipCreateRequest

class MembershipRepository:
    def get_membership_by_user_and_room(self, user_id: int, room_id: int):
        sql = """
            SELECT membership_id, role
            FROM room_membership
            WHERE user_id = %s AND room_id = %s AND is_active = TRUE
        """
        result = run_sql(sql, (user_id, room_id))

        membership_id, role = result[0]
        return {"membership_id": membership_id, "role": role}
    
    def is_admin(self, user_id: int, room_id: int):
        sql = """
            SELECT role
            FROM room_membership
            WHERE user_id = %s AND room_id = %s AND is_active = TRUE
        """
        result = run_sql(sql, (user_id, room_id))
        
        if not result:
            return False
            
        role = result[0][0]
        return role == Role.ADMIN.value
    
    def get_user_role(self, user_id: int, room_id: int) -> str:
        sql = """
            SELECT role
            FROM room_membership
            WHERE user_id = %s AND room_id = %s AND is_active = TRUE
        """
        result = run_sql(sql, (user_id, room_id))
        
        if not result:
            return None
            
        return result[0][0]
    
    def create_membership(self, membership: MembershipCreateRequest):
        sql = """
            INSERT INTO room_membership (user_id, room_id, role, joined_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING membership_id
        """
        params = (
            membership.user_id,
            membership.room_id,
            membership.role.value,
        )
        
        result = run_sql(sql, params)
        return {"membership_id": result[0][0], "role": membership.role.value}
    
    def update_user_role(self, user_id: int, room_id: int, new_role: Role):
        sql = """
            UPDATE room_membership
            SET role = %s
            WHERE user_id = %s AND room_id = %s AND is_active = TRUE
        """
        params = (new_role.value, user_id, room_id)
        run_sql(sql, params)
        return {"user_id": user_id, "room_id": room_id, "new_role": new_role.value}
    
    def get_members_by_room_id(self, room_id: int):
        sql = """
            SELECT u.user_id, u.name, rm.membership_id, rm.role
            FROM room_membership rm
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE rm.room_id = %s AND rm.is_active = TRUE
        """
        results = run_sql(sql, (room_id,))
        return [
            {
                "user_id": row[0],
                "name": row[1],
                "membership_id": row[2],
                "role": row[3]
            }
            for row in results
        ]