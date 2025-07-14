from src.models.chore import Chore, ChoreCreateRequest, ChoreWithAssignments, ChoreCompletion, ChoreCompletionCreateRequest, ChoreVerification, ChoreVerificationCreateRequest, ChoreWithCompletionStatus
from src.services.database.helper import run_sql

class ChoreRepository:
    def get_all_chores(self):
        sql = "SELECT * FROM chore"
        return run_sql(sql, output_class=Chore)
    
    def get_chores_by_user_id(self, user_id: int):
        sql = """
            SELECT c.*, 
                   STRING_AGG(DISTINCT ca.membership_id::text, ',') as assigned_member_ids,
                   STRING_AGG(DISTINCT u.name, ', ') as assigned_member_names
            FROM chore c
            JOIN room_membership rm ON c.room_id = rm.room_id
            LEFT JOIN chore_assignment ca ON c.chore_id = ca.chore_id AND ca.is_active = TRUE
            LEFT JOIN room_membership rm_assigned ON ca.membership_id = rm_assigned.membership_id
            LEFT JOIN "user" u ON rm_assigned.user_id = u.user_id
            WHERE rm.user_id = %s AND rm.is_active = TRUE
            GROUP BY c.chore_id, c.room_id, c.name, c.frequency, c.frequency_value, 
                     c.day_of_week, c.timing, c.description, c.start_date, 
                     c.last_completed, c.assigned_to, c.approval_required, c.photo_required,
                     c.is_active, c.created_at, c.updated_at
        """
        return run_sql(sql, (user_id,), output_class=ChoreWithAssignments)
    
    def get_chores_assigned_to_user(self, user_id: int):
        sql = """
            SELECT c.*,
                   STRING_AGG(DISTINCT ca.membership_id::text, ',') as assigned_member_ids,
                   STRING_AGG(DISTINCT u.name, ', ') as assigned_member_names
            FROM chore c
            JOIN chore_assignment ca ON c.chore_id = ca.chore_id
            JOIN room_membership rm ON ca.membership_id = rm.membership_id
            LEFT JOIN chore_assignment ca_all ON c.chore_id = ca_all.chore_id AND ca_all.is_active = TRUE
            LEFT JOIN room_membership rm_all ON ca_all.membership_id = rm_all.membership_id
            LEFT JOIN "user" u ON rm_all.user_id = u.user_id
            WHERE rm.user_id = %s AND rm.is_active = TRUE AND c.is_active = TRUE AND ca.is_active = TRUE
            GROUP BY c.chore_id, c.room_id, c.name, c.frequency, c.frequency_value, 
                     c.day_of_week, c.timing, c.description, c.start_date, 
                     c.last_completed, c.assigned_to, c.approval_required, c.photo_required,
                     c.is_active, c.created_at, c.updated_at
        """
        return run_sql(sql, (user_id,), output_class=ChoreWithAssignments)
    
    def get_chores_by_room_id(self, room_id: int):
        sql = """
            SELECT c.*,
                   STRING_AGG(DISTINCT ca.membership_id::text, ',') as assigned_member_ids,
                   STRING_AGG(DISTINCT u.name, ', ') as assigned_member_names
            FROM chore c
            LEFT JOIN chore_assignment ca ON c.chore_id = ca.chore_id AND ca.is_active = TRUE
            LEFT JOIN room_membership rm ON ca.membership_id = rm.membership_id
            LEFT JOIN "user" u ON rm.user_id = u.user_id
            WHERE c.room_id = %s
            GROUP BY c.chore_id, c.room_id, c.name, c.frequency, c.frequency_value, 
                     c.day_of_week, c.timing, c.description, c.start_date, 
                     c.last_completed, c.assigned_to, c.approval_required, c.photo_required,
                     c.is_active, c.created_at, c.updated_at
        """
        return run_sql(sql, (room_id,), output_class=ChoreWithAssignments)
    
    def get_chore_by_id(self, chore_id: int):
        sql = """
            SELECT c.*,
                   STRING_AGG(DISTINCT ca.membership_id::text, ',') as assigned_member_ids,
                   STRING_AGG(DISTINCT u.name, ', ') as assigned_member_names
            FROM chore c
            LEFT JOIN chore_assignment ca ON c.chore_id = ca.chore_id AND ca.is_active = TRUE
            LEFT JOIN room_membership rm ON ca.membership_id = rm.membership_id
            LEFT JOIN "user" u ON rm.user_id = u.user_id
            WHERE c.chore_id = %s
            GROUP BY c.chore_id, c.room_id, c.name, c.frequency, c.frequency_value, 
                     c.day_of_week, c.timing, c.description, c.start_date, 
                     c.last_completed, c.assigned_to, c.approval_required, c.photo_required,
                     c.is_active, c.created_at, c.updated_at
        """
        result = run_sql(sql, (chore_id,), output_class=ChoreWithAssignments)
        return result[0] if result else None

    def add_chore(self, chore: ChoreCreateRequest):
        sql = """
            INSERT INTO chore (
                room_id, name, frequency, frequency_value,
                day_of_week, timing, description, start_date, assigned_to, 
                approval_required, photo_required, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING chore_id
        """
        params = (
            chore.room_id,
            chore.name,
            chore.frequency,
            chore.frequency_value,
            chore.day_of_week,
            chore.timing,
            chore.description,
            chore.start_date,
            None,
            chore.approval_required if hasattr(chore, 'approval_required') else False,
            chore.photo_required if hasattr(chore, 'photo_required') else False,
            chore.is_active,
        )

        result = run_sql(sql, params)
        chore_id = result[0][0]
        
        # Handle multiple member assignments
        if chore.assigned_member_ids:
            self.assign_multiple_members(chore_id, chore.assigned_member_ids)
        elif chore.assigned_to:
            self.assign_chore(chore_id, chore.assigned_to)
        
        return {"chore_id": chore_id}

    def update_chore(self, chore_id: int, chore: ChoreCreateRequest):
        sql = """
            UPDATE chore
            SET room_id = %s, name = %s, frequency = %s, frequency_value = %s,
                day_of_week = %s, timing = %s, description = %s, start_date = %s,
                assigned_to = %s, approval_required = %s, photo_required = %s, is_active = %s
            WHERE chore_id = %s
        """
        params = (
            chore.room_id,
            chore.name,
            chore.frequency,
            chore.frequency_value,
            chore.day_of_week,
            chore.timing,
            chore.description,
            chore.start_date,
            None,
            chore.approval_required if hasattr(chore, 'approval_required') else False,
            chore.photo_required if hasattr(chore, 'photo_required') else False,
            chore.is_active,
            chore_id
        )
        run_sql(sql, params)
        
        # Handle multiple member assignments
        if chore.assigned_member_ids:
            self.assign_multiple_members(chore_id, chore.assigned_member_ids)
        elif chore.assigned_to:
            self.assign_multiple_members(chore_id, [chore.assigned_to])
        else:
            # If no assignments specified, unassign all
            self.unassign_chore(chore_id)

    def delete_chore(self, chore_id: int):
        sql = "DELETE FROM chore WHERE chore_id = %s"
        run_sql(sql, (chore_id,))

    def assign_chore(self, chore_id: int, membership_id: int):
        sql = """
            INSERT INTO chore_assignment (chore_id, membership_id, is_active)
            VALUES (%s, %s, TRUE)
            ON CONFLICT (chore_id, membership_id) 
            DO UPDATE SET is_active = TRUE, assigned_at = now()
        """
        run_sql(sql, (chore_id, membership_id))

    def unassign_chore(self, chore_id: int, membership_id: int | None = None):
        if membership_id:
            sql = "UPDATE chore_assignment SET is_active = FALSE WHERE chore_id = %s AND membership_id = %s"
            run_sql(sql, (chore_id, membership_id))
        else:
            # Unassign all members from the chore
            sql = "UPDATE chore_assignment SET is_active = FALSE WHERE chore_id = %s"
            run_sql(sql, (chore_id,))

    def get_chore_assignments(self, chore_id: int):
        sql = """
            SELECT ca.membership_id, u.name
            FROM chore_assignment ca
            JOIN room_membership rm ON ca.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE ca.chore_id = %s AND ca.is_active = TRUE
        """
        return run_sql(sql, (chore_id,))

    def assign_multiple_members(self, chore_id: int, membership_ids: list):
        # First unassign all current assignments
        self.unassign_chore(chore_id)
        
        # Then assign all the new members
        for membership_id in membership_ids:
            self.assign_chore(chore_id, membership_id)

    # Chore Completion Methods
    def create_completion(self, membership_id: int, completion_request: ChoreCompletionCreateRequest):
        """Mark a chore as completed by a member"""
        
        # First, get the chore to check if approval is required
        chore_sql = "SELECT approval_required, photo_required FROM chore WHERE chore_id = %s"
        chore_result = run_sql(chore_sql, (completion_request.chore_id,))
        
        if not chore_result:
            raise ValueError("Chore not found")
            
        approval_required, photo_required = chore_result[0]
        
        # Check if photo is required but not provided
        if photo_required and not completion_request.photo_url:
            raise ValueError("Photo proof is required for this chore")
        
        # Determine the initial status based on approval requirement
        initial_status = 'pending' if approval_required else 'approved'
        
        sql = """
            INSERT INTO chore_completion (chore_id, membership_id, photo_url, status)
            VALUES (%s, %s, %s, %s)
            RETURNING completion_id
        """
        result = run_sql(sql, (
            completion_request.chore_id,
            membership_id,
            completion_request.photo_url,
            initial_status
        ))
        completion_id = result[0][0]
        
        # Update chore's last_completed timestamp only if approved immediately
        if initial_status == 'approved':
            update_sql = """
                UPDATE chore 
                SET last_completed = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
                WHERE chore_id = %s
            """
            run_sql(update_sql, (completion_request.chore_id,))
        
        return {
            "completion_id": completion_id,
            "status": initial_status,
            "requires_approval": approval_required
        }

    def get_completion_by_id(self, completion_id: int):
        """Get a specific completion record"""
        sql = "SELECT * FROM chore_completion WHERE completion_id = %s"
        result = run_sql(sql, (completion_id,), output_class=ChoreCompletion)
        return result[0] if result else None

    def get_pending_completions_by_room(self, room_id: int):
        """Get all pending completions for a room"""
        sql = """
            SELECT cc.completion_id, cc.chore_id, cc.membership_id, cc.completed_at, 
                   cc.photo_url, cc.status, cc.points_earned, cc.created_at,
                   c.name as chore_name, u.name as completed_by_name
            FROM chore_completion cc
            JOIN chore c ON cc.chore_id = c.chore_id
            JOIN room_membership rm ON cc.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE c.room_id = %s AND cc.status = 'pending'
            ORDER BY cc.completed_at DESC
        """
        results = run_sql(sql, (room_id,))
        
        # Convert raw tuples to structured objects
        completions = []
        for row in results:
            completion = {
                "completionId": row[0],
                "choreId": row[1],
                "membershipId": row[2],
                "completedAt": row[3],
                "photoUrl": row[4],
                "status": row[5],
                "pointsEarned": row[6],
                "createdAt": row[7],
                "choreName": row[8],
                "completedBy": row[9]
            }
            completions.append(completion)
        
        return completions

    def get_user_completions(self, user_id: int, room_id: int = None):
        """Get completion history for a user"""
        base_sql = """
            SELECT cc.*, c.name as chore_name
            FROM chore_completion cc
            JOIN chore c ON cc.chore_id = c.chore_id
            JOIN room_membership rm ON cc.membership_id = rm.membership_id
            WHERE rm.user_id = %s
        """
        params = [user_id]
        
        if room_id:
            base_sql += " AND c.room_id = %s"
            params.append(room_id)
            
        base_sql += " ORDER BY cc.completed_at DESC"
        return run_sql(base_sql, params)

    # Chore Verification Methods
    def create_verification(self, verified_by_membership_id: int, verification_request: ChoreVerificationCreateRequest):
        """Verify a completed chore"""
        sql = """
            INSERT INTO chore_verification (completion_id, verified_by, verification_type, comment)
            VALUES (%s, %s, %s, %s)
            RETURNING verification_id
        """
        result = run_sql(sql, (
            verification_request.completion_id,
            verified_by_membership_id,
            verification_request.verification_type,
            verification_request.comment
        ))
        verification_id = result[0][0]
        
        # Update completion status based on verification
        status = "approved" if verification_request.verification_type == "approved" else "rejected"
        points = 10 if status == "approved" else 0  # Simple point system
        
        update_sql = """
            UPDATE chore_completion 
            SET status = %s, points_earned = %s 
            WHERE completion_id = %s
        """
        run_sql(update_sql, (status, points, verification_request.completion_id))
        
        # If approved, update the chore's last_completed timestamp
        if status == "approved":
            chore_update_sql = """
                UPDATE chore 
                SET last_completed = (
                    SELECT completed_at FROM chore_completion 
                    WHERE completion_id = %s
                ), updated_at = CURRENT_TIMESTAMP 
                WHERE chore_id = (
                    SELECT chore_id FROM chore_completion 
                    WHERE completion_id = %s
                )
            """
            run_sql(chore_update_sql, (verification_request.completion_id, verification_request.completion_id))
        
        return {"verification_id": verification_id}

    def get_chores_with_completion_status(self, room_id: int, user_id: int = None):
        """Get chores with their completion status"""
        sql = """
            SELECT c.*,
                   STRING_AGG(DISTINCT ca.membership_id::text, ',') as assigned_member_ids,
                   STRING_AGG(DISTINCT u.name, ', ') as assigned_member_names,
                   cc.completion_id,
                   cc.completed_at,
                   cc.photo_url,
                   cc.status as completion_status,
                   cc.points_earned,
                   CASE 
                       WHEN c.frequency = 'daily' THEN 
                           CASE WHEN c.last_completed IS NULL OR c.last_completed < CURRENT_DATE 
                                THEN TRUE ELSE FALSE END
                       WHEN c.frequency = 'weekly' THEN 
                           CASE WHEN c.last_completed IS NULL OR c.last_completed < (CURRENT_DATE - INTERVAL '7 days')
                                THEN TRUE ELSE FALSE END
                       WHEN c.frequency = 'monthly' THEN 
                           CASE WHEN c.last_completed IS NULL OR c.last_completed < (CURRENT_DATE - INTERVAL '30 days')
                                THEN TRUE ELSE FALSE END
                       ELSE FALSE
                   END as is_due
            FROM chore c
            LEFT JOIN chore_assignment ca ON c.chore_id = ca.chore_id AND ca.is_active = TRUE
            LEFT JOIN room_membership rm ON ca.membership_id = rm.membership_id
            LEFT JOIN "user" u ON rm.user_id = u.user_id
            LEFT JOIN chore_completion cc ON c.chore_id = cc.chore_id AND cc.status = 'pending'
            WHERE c.room_id = %s AND c.is_active = TRUE
        """
        params = [room_id]
        
        if user_id:
            sql += " AND ca.membership_id IN (SELECT membership_id FROM room_membership WHERE user_id = %s)"
            params.append(user_id)
            
        sql += """
            GROUP BY c.chore_id, c.room_id, c.name, c.frequency, c.frequency_value, 
                     c.day_of_week, c.timing, c.description, c.start_date, 
                     c.last_completed, c.assigned_to, c.approval_required, c.photo_required,
                     c.is_active, c.created_at, c.updated_at,
                     cc.completion_id, cc.completed_at, cc.photo_url, cc.status, cc.points_earned
            ORDER BY is_due DESC, c.name ASC
        """
        
        return run_sql(sql, params)