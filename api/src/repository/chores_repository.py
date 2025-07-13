from src.models.chore import Chore, ChoreCreateRequest, ChoreWithAssignments
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
                     c.last_completed, c.assigned_to, c.is_active, c.created_at, c.updated_at
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
                     c.last_completed, c.assigned_to, c.is_active, c.created_at, c.updated_at
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
                     c.last_completed, c.assigned_to, c.is_active, c.created_at, c.updated_at
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
                     c.last_completed, c.assigned_to, c.is_active, c.created_at, c.updated_at
        """
        result = run_sql(sql, (chore_id,), output_class=ChoreWithAssignments)
        return result[0] if result else None

    def add_chore(self, chore: ChoreCreateRequest):
        sql = """
            INSERT INTO chore (
                room_id, name, frequency, frequency_value,
                day_of_week, timing, description, start_date, assigned_to, is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                assigned_to = %s, is_active = %s
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