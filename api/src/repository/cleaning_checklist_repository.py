from src.models.cleaning_checklist import (
    CleaningChecklistCreateRequest, 
    CleaningChecklistUpdateRequest,
    CleaningCheckStatus,
    CleaningCheckStatusCreateRequest,
    CleaningChecklistWithStatus
)
from src.services.database.helper import run_sql
from datetime import datetime

class CleaningChecklistRepository:
    def get_checklist_by_room(self, room_id: int, date_filter: str = None):
        if date_filter is None:
            date_filter = datetime.now().strftime('%Y-%m-%d')
            
        sql = """
        SELECT 
            cl.checklist_item_id,
            cl.room_id,
            cl.title,
            cl.description,
            cl.is_default,
            COALESCE(STRING_AGG(CASE WHEN cs.is_assigned = TRUE THEN u.name END, ', '), '') as assigned_to,
            COALESCE(STRING_AGG(CASE WHEN cs.is_assigned = TRUE THEN cs.membership_id::text END, ','), '0') as assigned_membership_ids,
            COALESCE(BOOL_OR(cs.is_completed), false) as is_completed,
            MIN(cs.status_id) as status_id
        FROM cleaning_checklist cl
        LEFT JOIN cleaning_check_status cs ON cl.checklist_item_id = cs.checklist_item_id 
            AND cs.marked_date = %s
        LEFT JOIN room_membership rm ON cs.membership_id = rm.membership_id
        LEFT JOIN "user" u ON rm.user_id = u.user_id
        WHERE cl.room_id = %s
        GROUP BY cl.checklist_item_id, cl.room_id, cl.title, cl.description, cl.is_default
        ORDER BY cl.is_default DESC, cl.checklist_item_id ASC
        """
        return run_sql(sql, (date_filter, room_id), output_class=CleaningChecklistWithStatus)

    def add_checklist_item(self, item: CleaningChecklistCreateRequest):
        sql = """
        INSERT INTO cleaning_checklist (room_id, title, description, is_default)
        VALUES (%s, %s, %s, %s)
        RETURNING checklist_item_id
        """
        result = run_sql(sql, (item.room_id, item.title, item.description, item.is_default))
        return {"checklist_item_id": result[0][0]}

    def update_checklist_item(self, checklist_item_id: int, item: CleaningChecklistUpdateRequest):
        updates = []
        params = []
        
        if item.title is not None:
            updates.append("title = %s")
            params.append(item.title)
        if item.description is not None:
            updates.append("description = %s")
            params.append(item.description)
            
        if not updates:
            return None
            
        params.append(checklist_item_id)
        sql = f"UPDATE cleaning_checklist SET {', '.join(updates)} WHERE checklist_item_id = %s"
        run_sql(sql, params)
        return {"message": "Checklist item updated successfully"}

    def delete_checklist_item(self, checklist_item_id: int):
        sql = "DELETE FROM cleaning_checklist WHERE checklist_item_id = %s"
        run_sql(sql, (checklist_item_id,))
        return {"message": "Checklist item deleted successfully"}

    def create_default_checklist(self, room_id: int):
        default_items = [
            "Dishes",
            "Living Room/Front Porch", 
            "Stove/Oven",
            "Microwave/Fridge",
            "Bathtub & Vanities",
            "Bathroom & Toilet",
            "Bedroom 1",
            "Bedroom 2", 
            "Bedroom 3",
            "Bedroom 4",
            "Bedroom 5"
        ]
        
        created_items = []
        for title in default_items:
            sql = """
            INSERT INTO cleaning_checklist (room_id, title, description, is_default)
            VALUES (%s, %s, %s, %s)
            RETURNING checklist_item_id
            """
            result = run_sql(sql, (room_id, title, None, True))
            if result:
                created_items.append({"checklist_item_id": result[0][0], "title": title})
                
        return created_items


class CleaningCheckStatusRepository:
    def create_or_update_status(self, status: CleaningCheckStatusCreateRequest):
        sql = """
        INSERT INTO cleaning_check_status (checklist_item_id, membership_id, marked_date, is_completed, is_assigned, updated_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (checklist_item_id, membership_id, marked_date)
        DO UPDATE SET 
            is_completed = EXCLUDED.is_completed,
            is_assigned = EXCLUDED.is_assigned,
            updated_at = NOW()
        RETURNING status_id
        """
        result = run_sql(sql, (
            status.checklist_item_id,
            status.membership_id,
            status.marked_date,
            status.is_completed,
            status.is_assigned
        ))
        return {"status_id": result[0][0]}

    def assign_task(self, checklist_item_id: int, membership_id: int, marked_date: str):
        status = CleaningCheckStatusCreateRequest(
            checklist_item_id=checklist_item_id,
            membership_id=membership_id,
            marked_date=marked_date,
            is_completed=False,
            is_assigned=True
        )
        return self.create_or_update_status(status)

    def unassign_task(self, checklist_item_id: int, marked_date: str):
        sql = """
        DELETE FROM cleaning_check_status
        WHERE checklist_item_id = %s AND marked_date = %s
        """
        run_sql(sql, (checklist_item_id, marked_date))
        return {"message": "Task unassigned successfully"}

    def complete_task(self, checklist_item_id: int, membership_id: int, marked_date: str):
        status = CleaningCheckStatusCreateRequest(
            checklist_item_id=checklist_item_id,
            membership_id=membership_id,
            marked_date=marked_date,
            is_completed=True,
            is_assigned=False  # Just completing, not assigning
        )
        return self.create_or_update_status(status)

    def toggle_task(self, checklist_item_id: int, membership_id: int, marked_date: str):
        # Get current status
        sql = """
        SELECT is_completed, is_assigned FROM cleaning_check_status
        WHERE checklist_item_id = %s AND membership_id = %s AND marked_date = %s
        """
        result = run_sql(sql, (checklist_item_id, membership_id, marked_date))
        current_completion = result[0][0] if result else False
        current_assignment = result[0][1] if result else False
        
        # Toggle completion - keep assignment status as is, or set to False for new records
        status = CleaningCheckStatusCreateRequest(
            checklist_item_id=checklist_item_id,
            membership_id=membership_id,
            marked_date=marked_date,
            is_completed=not current_completion,
            is_assigned=current_assignment  # Keep existing assignment status, False for new records
        )
        return self.create_or_update_status(status)

    def reset_room_tasks(self, room_id: int, marked_date: str):
        sql = """
        UPDATE cleaning_check_status 
        SET is_completed = FALSE, updated_at = NOW()
        WHERE checklist_item_id IN (
            SELECT checklist_item_id FROM cleaning_checklist WHERE room_id = %s
        ) AND marked_date = %s
        """
        run_sql(sql, (room_id, marked_date))
        return {"message": "All tasks reset successfully"}

    def get_status_history(self, room_id: int, start_date: str, end_date: str):
        sql = """
        SELECT cs.status_id, cs.checklist_item_id, cs.membership_id, 
               cs.marked_date, cs.is_completed, cs.updated_at
        FROM cleaning_check_status cs
        JOIN cleaning_checklist cl ON cs.checklist_item_id = cl.checklist_item_id
        WHERE cl.room_id = %s AND cs.marked_date BETWEEN %s AND %s
        ORDER BY cs.marked_date DESC, cs.checklist_item_id ASC
        """
        return run_sql(sql, (room_id, start_date, end_date), output_class=CleaningCheckStatus)
