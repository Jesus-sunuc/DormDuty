from src.models.user import User
from src.services.database.helper import run_sql


class UserRepository:
    def get_all_users(self):
        sql = "SELECT * FROM \"user\""
        return run_sql(sql, output_class=User)