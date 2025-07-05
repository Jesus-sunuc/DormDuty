from datetime import datetime, timezone
import uuid
from src.models.room import Room
from src.models.room import RoomCreateRequest, RoomDeleteRequest, RoomUpdateRequest
from src.models.membership import Role
from src.services.database.helper import run_sql

class RoomRepository:
    def get_all_rooms(self):
        query = "SELECT * FROM room"
        return run_sql(query, output_class=Room)
    
    def get_rooms_by_user_id(self, user_id: int):
        sql = """
            SELECT r.*
            FROM room r
            JOIN room_membership rm ON r.room_id = rm.room_id
            WHERE rm.user_id = %s AND rm.is_active = TRUE
        """
        return run_sql(sql, (user_id,), output_class=Room)
    
    
    def generate_room_code(self) -> str:
        return str(uuid.uuid4())[:6].upper()
    
    def add_room(self, room: RoomCreateRequest):
        room_code = self.generate_room_code()

        sql = """
            INSERT INTO room (room_code, created_by, name, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING room_id
        """
        params = (
            room_code,
            room.created_by,
            room.name,
            datetime.now(timezone.utc),
            datetime.now(timezone.utc),
        )

        result = run_sql(sql, params)
        room_id = result[0][0]
        
        membership_sql = """
            INSERT INTO room_membership (user_id, room_id, role, joined_at)
            VALUES (%s, %s, %s, %s)
            RETURNING membership_id
        """
        membership_params = (
            room.created_by,
            room_id,
            Role.ADMIN.value,
            datetime.now(timezone.utc),
        )
        
        membership_result = run_sql(membership_sql, membership_params)
        membership_id = membership_result[0][0]
        
        return {
            "room_id": room_id, 
            "room_code": room_code,
            "membership_id": membership_id,
            "role": Role.ADMIN.value
        }
    
    def update_room(self, room: RoomUpdateRequest):
        sql = """
            UPDATE room
            SET name = %s,
                updated_at = %s
            WHERE room_id = %s
        """
        params = (
            room.name,
            datetime.now(timezone.utc),
            room.room_id,
        )
        run_sql(sql, params)
        return {"room_id": room.room_id}
    
    def delete_or_leave_room(self, req: RoomDeleteRequest):
        if req.is_admin:
            # Admin: delete everything related to the room
            delete_queries = [
                # 1. Invitations to the room
                "DELETE FROM room_invitation WHERE room_id = %s;",

                # 2. Verifications linked to completions
                """
                DELETE FROM chore_verification
                WHERE completion_id IN (
                    SELECT completion_id FROM chore_completion
                    WHERE chore_id IN (
                        SELECT chore_id FROM chore WHERE room_id = %s
                    )
                );
                """,

                # 3. Assignment history
                """
                DELETE FROM chore_assignment_history
                WHERE chore_id IN (
                    SELECT chore_id FROM chore WHERE room_id = %s
                );
                """,

                # 4. Swap requests (by chore or membership)
                """
                DELETE FROM chore_swap_request
                WHERE chore_id IN (
                    SELECT chore_id FROM chore WHERE room_id = %s
                ) OR from_membership IN (
                    SELECT membership_id FROM room_membership WHERE room_id = %s
                ) OR to_membership IN (
                    SELECT membership_id FROM room_membership WHERE room_id = %s
                );
                """,

                # 5. Chore completions (by chore or membership)
                """
                DELETE FROM chore_completion
                WHERE chore_id IN (
                    SELECT chore_id FROM chore WHERE room_id = %s
                ) OR membership_id IN (
                    SELECT membership_id FROM room_membership WHERE room_id = %s
                );
                """,

                # 6. Chores
                "DELETE FROM chore WHERE room_id = %s;",

                # 7. Expense splits (by expense or membership)
                """
                DELETE FROM expense_split
                WHERE expense_id IN (
                    SELECT expense_id FROM expense WHERE room_id = %s
                ) OR membership_id IN (
                    SELECT membership_id FROM room_membership WHERE room_id = %s
                );
                """,

                # 8. Expenses
                "DELETE FROM expense WHERE room_id = %s;",

                # 9. Room memberships
                "DELETE FROM room_membership WHERE room_id = %s;",

                # 10. Finally, the room
                "DELETE FROM room WHERE room_id = %s;"
            ]

            for query in delete_queries:
                room_id_count = query.count("%s")
                run_sql(query, tuple([req.room_id] * room_id_count))

            return {
                "deleted": True,
                "room_id": req.room_id,
                "admin_deleted": True
            }

        else:
            # Member: clean up chore and expense references before leaving
            run_sql("UPDATE chore SET assigned_to = NULL WHERE assigned_to = %s", (req.membership_id,))
            run_sql("DELETE FROM chore_verification WHERE verified_by = %s", (req.membership_id,))
            run_sql("DELETE FROM expense_split WHERE membership_id = %s", (req.membership_id,))
            run_sql("DELETE FROM chore_completion WHERE membership_id = %s", (req.membership_id,))
            run_sql("DELETE FROM chore_swap_request WHERE from_membership = %s OR to_membership = %s", (req.membership_id, req.membership_id,))
            run_sql("DELETE FROM chore_assignment_history WHERE membership_id = %s", (req.membership_id,))
            run_sql("DELETE FROM expense WHERE payer_membership_id = %s", (req.membership_id,))
            run_sql("DELETE FROM room_membership WHERE membership_id = %s", (req.membership_id,))

            return {
                "deleted": True,
                "left_room": True,
                "membership_id": req.membership_id
            }

        

