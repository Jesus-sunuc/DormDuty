from src.models.chore_swap_request import (
    ChoreSwapRequestWithDetails,
    ChoreSwapRequestCreateRequest,
    ChoreSwapRequestResponseRequest
)
from src.services.database.helper import run_sql

class ChoreSwapRequestRepository:
    
    def create_swap_request(self, from_membership_id: int, request: ChoreSwapRequestCreateRequest):
        sql = """
            INSERT INTO chore_swap_request (chore_id, from_membership, to_membership, message)
            VALUES (%s, %s, %s, %s)
            RETURNING swap_id
        """
        result = run_sql(sql, (request.chore_id, from_membership_id, request.to_membership, request.message))
        return {"swap_id": result[0][0]}
    
    def get_swap_requests_by_user(self, membership_id: int):
        """Get all swap requests sent by or received by a user"""
        sql = """
            SELECT 
                csr.swap_id,
                csr.chore_id,
                c.name as chore_name,
                csr.from_membership,
                u_from.name as from_user_name,
                csr.to_membership,
                u_to.name as to_user_name,
                csr.status,
                csr.message,
                csr.requested_at,
                csr.responded_at
            FROM chore_swap_request csr
            JOIN chore c ON csr.chore_id = c.chore_id
            JOIN room_membership rm_from ON csr.from_membership = rm_from.membership_id
            JOIN "user" u_from ON rm_from.user_id = u_from.user_id
            JOIN room_membership rm_to ON csr.to_membership = rm_to.membership_id
            JOIN "user" u_to ON rm_to.user_id = u_to.user_id
            WHERE csr.from_membership = %s OR csr.to_membership = %s
            ORDER BY csr.requested_at DESC
        """
        return run_sql(sql, (membership_id, membership_id), output_class=ChoreSwapRequestWithDetails)
    
    def get_pending_requests_for_user(self, membership_id: int):
        sql = """
            SELECT 
                csr.swap_id,
                csr.chore_id,
                c.name as chore_name,
                csr.from_membership,
                u_from.name as from_user_name,
                csr.to_membership,
                u_to.name as to_user_name,
                csr.status,
                csr.message,
                csr.requested_at,
                csr.responded_at
            FROM chore_swap_request csr
            JOIN chore c ON csr.chore_id = c.chore_id
            JOIN room_membership rm_from ON csr.from_membership = rm_from.membership_id
            JOIN "user" u_from ON rm_from.user_id = u_from.user_id
            JOIN room_membership rm_to ON csr.to_membership = rm_to.membership_id
            JOIN "user" u_to ON rm_to.user_id = u_to.user_id
            WHERE csr.to_membership = %s AND csr.status = 'pending'
            ORDER BY csr.requested_at ASC
        """
        return run_sql(sql, (membership_id,), output_class=ChoreSwapRequestWithDetails)
    
    def get_swap_requests_by_room(self, room_id: int):
        sql = """
            SELECT 
                csr.swap_id,
                csr.chore_id,
                c.name as chore_name,
                csr.from_membership,
                u_from.name as from_user_name,
                csr.to_membership,
                u_to.name as to_user_name,
                csr.status,
                csr.message,
                csr.requested_at,
                csr.responded_at
            FROM chore_swap_request csr
            JOIN chore c ON csr.chore_id = c.chore_id
            JOIN room_membership rm_from ON csr.from_membership = rm_from.membership_id
            JOIN "user" u_from ON rm_from.user_id = u_from.user_id
            JOIN room_membership rm_to ON csr.to_membership = rm_to.membership_id
            JOIN "user" u_to ON rm_to.user_id = u_to.user_id
            WHERE c.room_id = %s
            ORDER BY csr.requested_at DESC
        """
        return run_sql(sql, (room_id,), output_class=ChoreSwapRequestWithDetails)
    
    def respond_to_swap_request(self, swap_id: int, response: ChoreSwapRequestResponseRequest):
        sql = """
            UPDATE chore_swap_request 
            SET status = %s, responded_at = NOW()
            WHERE swap_id = %s AND status = 'pending'
            RETURNING swap_id
        """
        result = run_sql(sql, (response.status, swap_id))
        if not result:
            return None
        
        if response.status == 'accepted':
            self._execute_chore_swap(swap_id)
            self._cancel_redundant_swap_requests(swap_id)
        
        return {"swap_id": result[0][0], "status": response.status}
    
    def _execute_chore_swap(self, swap_id: int):
        """Execute the actual chore assignment swap"""
        swap_sql = """
            SELECT chore_id, from_membership, to_membership
            FROM chore_swap_request
            WHERE swap_id = %s
        """
        swap_result = run_sql(swap_sql, (swap_id,))
        if not swap_result:
            return
        
        chore_id, from_membership, to_membership = swap_result[0]
        
        remove_sql = """
            DELETE FROM chore_assignment 
            WHERE chore_id = %s AND membership_id = %s
        """
        run_sql(remove_sql, (chore_id, from_membership))
        
        add_sql = """
            INSERT INTO chore_assignment (chore_id, membership_id, assigned_at, is_active)
            VALUES (%s, %s, NOW(), TRUE)
            ON CONFLICT (chore_id, membership_id) 
            DO UPDATE SET is_active = TRUE, assigned_at = NOW()
        """
        run_sql(add_sql, (chore_id, to_membership))
    
    def _cancel_redundant_swap_requests(self, accepted_swap_id: int):
        """Cancel other pending swap requests for the same chore from the same requester 
        when one request has been accepted"""
        
        swap_details_sql = """
            SELECT chore_id, from_membership
            FROM chore_swap_request
            WHERE swap_id = %s
        """
        swap_result = run_sql(swap_details_sql, (accepted_swap_id,))
        if not swap_result:
            return
        
        chore_id, original_from_membership = swap_result[0]
        
        cancel_sql = """
            UPDATE chore_swap_request 
            SET status = 'cancelled', responded_at = NOW()
            WHERE chore_id = %s 
            AND from_membership = %s 
            AND status = 'pending'
            AND swap_id != %s
        """
        run_sql(cancel_sql, (chore_id, original_from_membership, accepted_swap_id))
    
    def cancel_swap_request(self, swap_id: int, membership_id: int):
        """Cancel a pending swap request (only by the requester)"""
        sql = """
            DELETE FROM chore_swap_request
            WHERE swap_id = %s AND from_membership = %s AND status = 'pending'
            RETURNING swap_id
        """
        result = run_sql(sql, (swap_id, membership_id))
        return {"swap_id": result[0][0]} if result else None
    
    def get_swap_request_by_id(self, swap_id: int):
        """Get a specific swap request by ID"""
        sql = """
            SELECT 
                csr.swap_id,
                csr.chore_id,
                c.name as chore_name,
                csr.from_membership,
                u_from.name as from_user_name,
                csr.to_membership,
                u_to.name as to_user_name,
                csr.status,
                csr.message,
                csr.requested_at,
                csr.responded_at
            FROM chore_swap_request csr
            JOIN chore c ON csr.chore_id = c.chore_id
            JOIN room_membership rm_from ON csr.from_membership = rm_from.membership_id
            JOIN "user" u_from ON rm_from.user_id = u_from.user_id
            JOIN room_membership rm_to ON csr.to_membership = rm_to.membership_id
            JOIN "user" u_to ON rm_to.user_id = u_to.user_id
            WHERE csr.swap_id = %s
        """
        result = run_sql(sql, (swap_id,), output_class=ChoreSwapRequestWithDetails)
        return result[0] if result else None
