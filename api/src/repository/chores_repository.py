from typing import List
from src.models.chore import Chore
from src.services.database.database import get_connection


class ChoreRepository:
    async def get_all_chores(self) -> List[Chore]:
        conn = await get_connection()
        try:
            records = await conn.fetch("SELECT * FROM dormduty.chore")
            return [Chore(**dict(record)) for record in records]
        finally:
            await conn.close()
