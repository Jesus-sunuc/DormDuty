from typing import List
from src.models.chore import Chore
from src.services.database.helper import run_sql


class ChoreRepository:
    def get_all_chores(self) -> List[Chore]:
        query = "SELECT * FROM dormduty.chore"
        return run_sql(query, output_class=Chore)