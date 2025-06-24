from typing import List
from src.models.chore import Chore
from src.services.database.helper import run_sql


class ChoreRepository:
    def get_all_chores(self):
        sql = "SELECT * FROM chore"
        return run_sql(sql, output_class=Chore)
    
    def get_chores_by_room_id(self, room_id: int):
        sql = "SELECT * FROM chore WHERE room_id = %s"
        return run_sql(sql, (room_id,), output_class=Chore)
