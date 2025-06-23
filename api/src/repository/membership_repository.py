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