from src.models.announcement_reply_reaction import AnnouncementReplyReactionCreateRequest, AnnouncementReplyReactionResponse
from src.services.database.helper import run_sql
from typing import List

class AnnouncementReplyReactionRepository:
    def get_reactions_by_reply(self, reply_id: int, limit: int = 50) -> List[AnnouncementReplyReactionResponse]:
        sql = """
            SELECT 
                r.reaction_id,
                r.reply_id,
                r.membership_id,
                r.emoji,
                r.reacted_at,
                u.name as member_name
            FROM announcement_reply_reaction r
            JOIN room_membership rm ON r.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE r.reply_id = %s
            ORDER BY r.reacted_at ASC
            LIMIT %s
        """
        return run_sql(sql, [reply_id, limit], output_class=AnnouncementReplyReactionResponse)

    def create_reaction(self, reaction: AnnouncementReplyReactionCreateRequest, membership_id: int) -> AnnouncementReplyReactionResponse:
        sql = """
            WITH new_reaction AS (
                INSERT INTO announcement_reply_reaction (reply_id, membership_id, emoji)
                VALUES (%s, %s, %s)
                RETURNING reaction_id, reply_id, membership_id, emoji, reacted_at
            )
            SELECT 
                nr.reaction_id,
                nr.reply_id,
                nr.membership_id,
                nr.emoji,
                nr.reacted_at,
                u.name as member_name
            FROM new_reaction nr
            JOIN room_membership rm ON nr.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
        """
        result = run_sql(sql, [reaction.reply_id, membership_id, reaction.emoji], output_class=AnnouncementReplyReactionResponse)
        return result[0] if result else None

    def get_user_reaction(self, reply_id: int, membership_id: int) -> AnnouncementReplyReactionResponse:
        sql = """
            SELECT 
                r.reaction_id,
                r.reply_id,
                r.membership_id,
                r.emoji,
                r.reacted_at,
                u.name as member_name
            FROM announcement_reply_reaction r
            JOIN room_membership rm ON r.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE r.reply_id = %s AND r.membership_id = %s
        """
        result = run_sql(sql, [reply_id, membership_id], output_class=AnnouncementReplyReactionResponse)
        return result[0] if result else None

    def update_or_create_reaction(self, reaction: AnnouncementReplyReactionCreateRequest, membership_id: int) -> AnnouncementReplyReactionResponse:
        existing_reaction = self.get_user_reaction(reaction.reply_id, membership_id)
        
        if existing_reaction:
            sql = """
                UPDATE announcement_reply_reaction 
                SET emoji = %s, reacted_at = CURRENT_TIMESTAMP
                WHERE reaction_id = %s
                RETURNING reaction_id, reply_id, membership_id, emoji, reacted_at
            """
            result = run_sql(sql, [reaction.emoji, existing_reaction.reactionId])
            
            if result:
                return self.get_user_reaction(reaction.reply_id, membership_id)
        else:
            return self.create_reaction(reaction, membership_id)

    def delete_user_reaction(self, reply_id: int, membership_id: int) -> bool:
        sql = """
            DELETE FROM announcement_reply_reaction 
            WHERE reply_id = %s AND membership_id = %s
            RETURNING reaction_id
        """
        result = run_sql(sql, [reply_id, membership_id])
        return len(result) > 0
