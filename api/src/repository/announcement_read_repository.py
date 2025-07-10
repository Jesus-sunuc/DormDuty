from src.models.announcement_read import AnnouncementReadCreateRequest, AnnouncementReadResponse
from src.services.database.helper import run_sql
from typing import List

class AnnouncementReadRepository:
    def mark_as_read(self, announcement_id: int, membership_id: int) -> AnnouncementReadResponse:
        """Mark an announcement as read by a user"""
        sql = """
            INSERT INTO announcement_read (announcement_id, membership_id)
            VALUES (%s, %s)
            ON CONFLICT (announcement_id, membership_id) 
            DO UPDATE SET read_at = CURRENT_TIMESTAMP
            RETURNING announcement_id, membership_id, read_at
        """
        result = run_sql(sql, [announcement_id, membership_id])
        
        if result:
            # Get member name for response
            member_sql = """
                SELECT u.name as member_name
                FROM room_membership rm
                JOIN "user" u ON rm.user_id = u.user_id
                WHERE rm.membership_id = %s
            """
            member_result = run_sql(member_sql, [membership_id])
            member_name = member_result[0]['member_name'] if member_result else "Unknown"
            
            return AnnouncementReadResponse(
                read_id=0,  # We don't have a separate read_id in this design
                announcement_id=result[0]['announcement_id'],
                membership_id=result[0]['membership_id'],
                read_at=result[0]['read_at'],
                member_name=member_name
            )
        return None

    def get_readers_by_announcement(self, announcement_id: int) -> List[AnnouncementReadResponse]:
        """Get all users who have read an announcement"""
        sql = """
            SELECT 
                ar.announcement_id,
                ar.membership_id,
                ar.read_at,
                u.name as member_name
            FROM announcement_read ar
            JOIN room_membership rm ON ar.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE ar.announcement_id = %s
            ORDER BY ar.read_at ASC
        """
        results = run_sql(sql, [announcement_id])
        
        return [
            AnnouncementReadResponse(
                read_id=0,
                announcement_id=row['announcement_id'],
                membership_id=row['membership_id'],
                read_at=row['read_at'],
                member_name=row['member_name']
            )
            for row in results
        ]

    def is_read_by_user(self, announcement_id: int, membership_id: int) -> bool:
        """Check if an announcement has been read by a specific user"""
        sql = """
            SELECT 1 FROM announcement_read 
            WHERE announcement_id = %s AND membership_id = %s
        """
        result = run_sql(sql, [announcement_id, membership_id])
        return len(result) > 0

    def get_unread_announcements_for_user(self, room_id: int, membership_id: int) -> List[int]:
        """Get announcement IDs that haven't been read by the user"""
        sql = """
            SELECT a.announcement_id
            FROM announcement a
            LEFT JOIN announcement_read ar ON a.announcement_id = ar.announcement_id 
                AND ar.membership_id = %s
            WHERE a.room_id = %s AND ar.announcement_id IS NULL
            ORDER BY a.created_at DESC
        """
        results = run_sql(sql, [membership_id, room_id])
        return [row['announcement_id'] for row in results]
