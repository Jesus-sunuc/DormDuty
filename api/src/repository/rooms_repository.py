from typing import List
from src.models.room import Room
from src.services.database.helper import run_sql

class RoomRepository:
    def get_all_rooms(self) -> List[Room]:
        query = "SELECT * FROM room"
        return run_sql(query, output_class=Room)