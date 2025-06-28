from src.services.database.helper import run_sql

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
    
    
    def get_members_by_room_id(self, room_id: int):
        sql = """
            SELECT u.user_id, u.name, rm.membership_id
            FROM room_membership rm
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE rm.room_id = %s AND rm.is_active = TRUE
        """
        return run_sql(sql, (room_id,))