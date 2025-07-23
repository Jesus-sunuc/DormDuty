from src.models.user import User
from src.services.database.helper import run_sql


class UserRepository:
    def get_all_users(self):
        sql = "SELECT * FROM \"user\""
        return run_sql(sql, output_class=User)
    
    def get_user_by_firebase_uid(self, fb_uid: str):
        sql = "SELECT * FROM \"user\" WHERE fb_uid = %s"
        result = run_sql(sql, (fb_uid,), output_class=User)
        return result[0] if result else None
    
    def get_user_by_email(self, email: str):
        sql = "SELECT * FROM \"user\" WHERE email = %s"
        result = run_sql(sql, (email,), output_class=User)
        return result[0] if result else None
    
    def update_user_firebase_uid(self, user_id: int, new_fb_uid: str):
        sql = """
        UPDATE "user" 
        SET fb_uid = %s, updated_at = NOW()
        WHERE user_id = %s
        RETURNING *
        """
        result = run_sql(sql, (new_fb_uid, user_id), output_class=User)
        return result[0] if result else None
    
    def create_user(self, fb_uid: str, email: str, name: str, avatar_url: str = None):
        sql = """
        INSERT INTO "user" (fb_uid, email, name, avatar_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
        RETURNING *
        """
        result = run_sql(sql, (fb_uid, email, name, avatar_url), output_class=User)
        return result[0] if result else None