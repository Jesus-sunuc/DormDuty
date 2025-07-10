from src.models.announcement_reaction import AnnouncementReactionCreateRequest, AnnouncementReactionResponse
from src.services.database.helper import run_sql
from typing import List

class AnnouncementReactionRepository:
    def get_reactions_by_announcement(self, announcement_id: int, limit: int = 50) -> List[AnnouncementReactionResponse]:
        sql = """
            SELECT 
                r.reaction_id,
                r.announcement_id,
                r.membership_id,
                r.emoji,
                r.reacted_at,
                u.name as member_name
            FROM announcement_reaction r
            JOIN room_membership rm ON r.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE r.announcement_id = %s
            ORDER BY r.reacted_at ASC
            LIMIT %s
        """
        return run_sql(sql, [announcement_id, limit], output_class=AnnouncementReactionResponse)

    def create_reaction(self, reaction: AnnouncementReactionCreateRequest, membership_id: int) -> AnnouncementReactionResponse:
        sql = """
            WITH new_reaction AS (
                INSERT INTO announcement_reaction (announcement_id, membership_id, emoji)
                VALUES (%s, %s, %s)
                RETURNING reaction_id, announcement_id, membership_id, emoji, reacted_at
            )
            SELECT 
                nr.reaction_id,
                nr.announcement_id,
                nr.membership_id,
                nr.emoji,
                nr.reacted_at,
                u.name as member_name
            FROM new_reaction nr
            JOIN room_membership rm ON nr.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
        """
        result = run_sql(sql, [reaction.announcement_id, membership_id, reaction.emoji], output_class=AnnouncementReactionResponse)
        return result[0] if result else None

    def delete_reaction(self, reaction_id: int, membership_id: int) -> bool:
        sql = """
            DELETE FROM announcement_reaction 
            WHERE reaction_id = %s AND membership_id = %s
            RETURNING reaction_id
        """
        result = run_sql(sql, [reaction_id, membership_id])
        return len(result) > 0

    def get_user_reaction(self, announcement_id: int, membership_id: int) -> AnnouncementReactionResponse:
        sql = """
            SELECT 
                r.reaction_id,
                r.announcement_id,
                r.membership_id,
                r.emoji,
                r.reacted_at,
                u.name as member_name
            FROM announcement_reaction r
            JOIN room_membership rm ON r.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE r.announcement_id = %s AND r.membership_id = %s
        """
        result = run_sql(sql, [announcement_id, membership_id], output_class=AnnouncementReactionResponse)
        return result[0] if result else None

    def update_or_create_reaction(self, reaction: AnnouncementReactionCreateRequest, membership_id: int) -> AnnouncementReactionResponse:
        existing_reaction = self.get_user_reaction(reaction.announcement_id, membership_id)
        
        if existing_reaction:
            sql = """
                UPDATE announcement_reaction 
                SET emoji = %s, reacted_at = CURRENT_TIMESTAMP
                WHERE reaction_id = %s
                RETURNING reaction_id, announcement_id, membership_id, emoji, reacted_at
            """
            result = run_sql(sql, [reaction.emoji, existing_reaction.reaction_id])
            
            if result:
                return self.get_user_reaction(reaction.announcement_id, membership_id)
        else:
            return self.create_reaction(reaction, membership_id)

    def delete_user_reaction(self, announcement_id: int, membership_id: int) -> bool:
        sql = """
            DELETE FROM announcement_reaction 
            WHERE announcement_id = %s AND membership_id = %s
            RETURNING reaction_id
        """
        result = run_sql(sql, [announcement_id, membership_id])
        return len(result) > 0
