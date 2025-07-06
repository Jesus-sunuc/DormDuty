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

        if not result:
            return None
        
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
    
    def join_room_by_code(self, user_id: int, room_code: str):
        room_sql = """
            SELECT room_id
            FROM room
            WHERE room_code = %s
        """
        room_result = run_sql(room_sql, (room_code,))
        if not room_result:
            return {"error": "Room not found with the provided code"}
        room_id = room_result[0][0]
        
        existing_sql = """
            SELECT membership_id, role
            FROM room_membership
            WHERE user_id = %s AND room_id = %s AND is_active = TRUE
        """
        existing_result = run_sql(existing_sql, (user_id, room_id))
        
        if existing_result:
            membership_id, role = existing_result[0]
            return {
                "membership_id": membership_id, 
                "role": role,
                "room_id": room_id,
                "message": "Already a member of this room"
            }
        
        membership_sql = """
            INSERT INTO room_membership (user_id, room_id, role, joined_at)
            VALUES (%s, %s, %s, NOW())
            RETURNING membership_id
        """
        membership_params = (user_id, room_id, Role.MEMBER.value)
        membership_result = run_sql(membership_sql, membership_params)
        
        return {
            "membership_id": membership_result[0][0], 
            "role": Role.MEMBER.value,
            "room_id": room_id,
            "message": "Successfully joined room"
        }
    
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
    
    def leave_room(self, membership_id: int, room_id: int):
        """
        Handle leaving a room and auto-delete room if last member
        """
        run_sql("UPDATE chore SET assigned_to = NULL WHERE assigned_to = %s", (membership_id,))
        run_sql("DELETE FROM chore_verification WHERE verified_by = %s", (membership_id,))
        run_sql("DELETE FROM expense_split WHERE membership_id = %s", (membership_id,))
        run_sql("DELETE FROM chore_completion WHERE membership_id = %s", (membership_id,))
        run_sql("DELETE FROM chore_swap_request WHERE from_membership = %s OR to_membership = %s", (membership_id, membership_id,))
        run_sql("DELETE FROM chore_assignment_history WHERE membership_id = %s", (membership_id,))
        run_sql("DELETE FROM expense WHERE payer_membership_id = %s", (membership_id,))
        
        run_sql("DELETE FROM room_membership WHERE membership_id = %s", (membership_id,))
        
        remaining_members_sql = """
            SELECT COUNT(*) FROM room_membership 
            WHERE room_id = %s AND is_active = TRUE
        """
        remaining_count = run_sql(remaining_members_sql, (room_id,))[0][0]
        
        if remaining_count == 0:
            self._delete_room_completely(room_id)
            return {
                "left_room": True,
                "room_deleted": True,
                "membership_id": membership_id,
                "message": "Left room successfully. Room was deleted as you were the last member."
            }
        else:
            return {
                "left_room": True,
                "room_deleted": False,
                "membership_id": membership_id,
                "message": "Left room successfully."
            }
    
    def _delete_room_completely(self, room_id: int):
        """
        Delete room and all related data completely
        """
        delete_queries = [
            """DELETE FROM chore_verification 
               WHERE completion_id IN (
                   SELECT completion_id FROM chore_completion 
                   WHERE chore_id IN (SELECT chore_id FROM chore WHERE room_id = %s)
               );""",
            "DELETE FROM chore_completion WHERE chore_id IN (SELECT chore_id FROM chore WHERE room_id = %s);",
            "DELETE FROM chore_swap_request WHERE chore_id IN (SELECT chore_id FROM chore WHERE room_id = %s);",
            "DELETE FROM chore_assignment_history WHERE chore_id IN (SELECT chore_id FROM chore WHERE room_id = %s);",
            "DELETE FROM expense_split WHERE expense_id IN (SELECT expense_id FROM expense WHERE room_id = %s);",
            "DELETE FROM expense WHERE room_id = %s;",
            "DELETE FROM chore WHERE room_id = %s;",
            "DELETE FROM room_membership WHERE room_id = %s;",
            "DELETE FROM room WHERE room_id = %s;"
        ]

        for query in delete_queries:
            room_id_count = query.count("%s")
            run_sql(query, tuple([room_id] * room_id_count))