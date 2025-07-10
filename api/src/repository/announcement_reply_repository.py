from src.models.announcement_reply import AnnouncementReplyCreateRequest, AnnouncementReplyResponse
from src.services.database.helper import run_sql
from typing import List

class AnnouncementReplyRepository:
    def get_replies_by_announcement(self, announcement_id: int, limit: int = 50) -> List[AnnouncementReplyResponse]:
        sql = """
            SELECT 
                r.reply_id,
                r.announcement_id,
                r.membership_id,
                r.message,
                r.replied_at,
                u.name as member_name
            FROM announcement_reply r
            JOIN room_membership rm ON r.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE r.announcement_id = %s
            ORDER BY r.replied_at ASC
            LIMIT %s
        """
        return run_sql(sql, [announcement_id, limit], output_class=AnnouncementReplyResponse)

    def create_reply(self, reply: AnnouncementReplyCreateRequest, membership_id: int) -> AnnouncementReplyResponse:
        sql = """
            WITH new_reply AS (
                INSERT INTO announcement_reply (announcement_id, membership_id, message)
                VALUES (%s, %s, %s)
                RETURNING reply_id, announcement_id, membership_id, message, replied_at
            )
            SELECT 
                nr.reply_id,
                nr.announcement_id,
                nr.membership_id,
                nr.message,
                nr.replied_at,
                u.name as member_name
            FROM new_reply nr
            JOIN room_membership rm ON nr.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
        """
        result = run_sql(sql, [reply.announcement_id, membership_id, reply.message], output_class=AnnouncementReplyResponse)
        return result[0] if result else None

    def delete_reply(self, reply_id: int, membership_id: int) -> bool:
        sql = """
            DELETE FROM announcement_reply 
            WHERE reply_id = %s AND membership_id = %s
            RETURNING reply_id
        """
        result = run_sql(sql, [reply_id, membership_id])
        return len(result) > 0
