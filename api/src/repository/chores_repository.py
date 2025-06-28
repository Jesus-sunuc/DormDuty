from datetime import datetime, timezone
from src.models.chore import Chore, ChoreCreateRequest
from src.services.database.helper import run_sql


class ChoreRepository:
    def get_all_chores(self):
        sql = "SELECT * FROM chore"
        return run_sql(sql, output_class=Chore)
    
    def get_chores_by_room_id(self, room_id: int):
        sql = "SELECT * FROM chore WHERE room_id = %s"
        return run_sql(sql, (room_id,), output_class=Chore)

    def add_chore(self, chore: ChoreCreateRequest):
        sql = """
            INSERT INTO chore (
                room_id, name, frequency, frequency_value,
                day_of_week, timing, description, start_date, assigned_to, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING chore_id
        """
        params = (
            chore.room_id,
            chore.name,
            chore.frequency,
            chore.frequency_value,
            chore.day_of_week,
            chore.timing,
            chore.description,
            chore.start_date,
            chore.assigned_to,
            chore.is_active,
        )

        result = run_sql(sql, params)
        return {"chore_id": result[0][0]}