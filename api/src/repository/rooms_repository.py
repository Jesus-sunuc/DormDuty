from typing import List
from src.models.room import Room
from src.services.database.helper import run_sql

class RoomRepository:
    def get_all_rooms(self) -> List[Room]:
        query = "SELECT * FROM room"
        return run_sql(query, output_class=Room)

    # def create_room(self, name: str, created_by: int, room_code: str) -> Room:
    #     query = """
    #     INSERT INTO room (name, created_by, room_code, created_at, updated_at)
    #     VALUES (:name, :created_by, :room_code, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    #     RETURNING *;
    #     """
    #     return run_sql(query, {"name": name, "created_by": created_by, "room_code": room_code}, output_class=Room, one=True)
