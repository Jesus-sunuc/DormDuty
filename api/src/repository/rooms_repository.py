from datetime import datetime, timezone
import uuid
from src.models.room import Room
from src.models.room import RoomCreateRequest, RoomUpdateRequest
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
    
    def get_room_by_id(self, room_id: int):
        sql = "SELECT * FROM room WHERE room_id = %s"
        result = run_sql(sql, (room_id,), output_class=Room)
        return result[0] if result else None
    
    
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