import datetime
from typing import Dict
import uuid
from src.models.room import RoomCreateRequest, RoomUpdateRequest
from src.services.database.helper import run_sql

class RoomAdminRepository:
    def generate_room_code(self) -> str:
        return str(uuid.uuid4())[:6].upper()
    
    def add_room(self, room: RoomCreateRequest):
        room_code = self.generate_room_code()
        now = datetime.datetime.now()

        sql = """
            INSERT INTO room (room_code, created_by, name, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING room_id
        """
        params = (
            room_code,
            room.created_by,
            room.name,
            now,
            now,
        )

        result = run_sql(sql, params)
        return {"room_id": result[0][0], "room_code": room_code}
    
    def update_room(self, room: RoomUpdateRequest):
        sql = """
            UPDATE room
            SET name = %s, updated_at = %s
            WHERE room_id = %s
        """
        params = (
            room.name,
            room.updated_at,
            room.room_id
        )

        run_sql(sql, params)
        return {"message": "Room updated successfully"}