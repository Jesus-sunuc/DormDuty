from src.models.announcement import AnnouncementCreateRequest, AnnouncementResponse
from src.services.database.helper import run_sql
from typing import List, Optional


class AnnouncementRepository:
    def get_announcements_by_room(self, room_id: int, limit: int = 50) -> List[AnnouncementResponse]:
        sql = """
            SELECT 
                a.announcement_id,
                a.room_id,
                a.created_by,
                a.message,
                a.created_at,
                a.can_reply,
                u.name as member_name
            FROM announcement a
            JOIN room_membership rm ON a.created_by = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE a.room_id = %s
            ORDER BY a.created_at DESC
            LIMIT %s
        """
        return run_sql(sql, [room_id, limit], output_class=AnnouncementResponse)

    def create_announcement(self, announcement: AnnouncementCreateRequest, membership_id: int) -> AnnouncementResponse:
        sql = """
            WITH new_announcement AS (
                INSERT INTO announcement (room_id, created_by, message, can_reply)
                VALUES (%s, %s, %s, %s)
                RETURNING announcement_id, room_id, created_by, message, created_at, can_reply
            )
            SELECT 
                na.announcement_id,
                na.room_id,
                na.created_by,
                na.message,
                na.created_at,
                na.can_reply,
                u.name as member_name
            FROM new_announcement na
            JOIN room_membership rm ON na.created_by = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
        """
        result = run_sql(sql, [announcement.room_id, membership_id, announcement.message, announcement.can_reply], output_class=AnnouncementResponse)
        return result[0] if result else None

    def get_announcement_by_id(self, announcement_id: int) -> Optional[AnnouncementResponse]:
        sql = """
            SELECT 
                a.announcement_id,
                a.room_id,
                a.created_by,
                a.message,
                a.created_at,
                a.can_reply,
                u.name as member_name
            FROM announcement a
            JOIN room_membership rm ON a.created_by = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE a.announcement_id = %s
        """
        result = run_sql(sql, [announcement_id], output_class=AnnouncementResponse)
        return result[0] if result else None

    def delete_announcement(self, announcement_id: int, membership_id: int) -> bool:
        sql = """
            DELETE FROM announcement 
            WHERE announcement_id = %s AND created_by = %s
            RETURNING announcement_id
        """
        result = run_sql(sql, [announcement_id, membership_id])
        return len(result) > 0
