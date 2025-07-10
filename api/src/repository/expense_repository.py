from datetime import datetime, timezone
from typing import List, Optional
from src.services.database.helper import run_sql
from src.models.expense import ExpenseCreateRequest, ExpenseUpdateRequest, Expense, ExpenseSplit, ExpenseWithSplits, ExpensePaymentRequest
from decimal import Decimal

class ExpenseRepository:
    
    def create_expense(self, expense: ExpenseCreateRequest):
        expense_sql = """
            INSERT INTO expense (room_id, payer_membership_id, amount, description, category, expense_date, receipt_url, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING expense_id
        """
        params = (
            expense.room_id,
            expense.payer_membership_id,
            expense.amount,
            expense.description,
            expense.category,
            expense.expense_date,
            expense.receipt_url,
            datetime.now(timezone.utc)
        )
        
        result = run_sql(expense_sql, params)
        expense_id = result[0][0]
        
        total_people = len(expense.split_with)
        if total_people == 0:
            raise ValueError("Must specify at least one person to split with")
        
        amount_per_person = expense.amount / total_people
        
        for membership_id in expense.split_with:
            split_sql = """
                INSERT INTO expense_split (expense_id, membership_id, amount_owed, is_paid, paid_at)
                VALUES (%s, %s, %s, %s, %s)
            """
            # If the payer is in the split list, mark them as already paid
            is_paid = membership_id == expense.payer_membership_id
            paid_at = datetime.now(timezone.utc) if is_paid else None
            
            split_params = (expense_id, membership_id, amount_per_person, is_paid, paid_at)
            run_sql(split_sql, split_params)
        
        return {"expense_id": expense_id, "amount_per_person": float(amount_per_person)}
    
    def get_expenses_by_room(self, room_id: int) -> List[ExpenseWithSplits]:
        sql = """
            SELECT 
                e.expense_id, e.room_id, e.payer_membership_id, u.name as payer_name,
                e.amount, e.description, e.category, e.expense_date, e.receipt_url, e.created_at
            FROM expense e
            JOIN room_membership rm ON e.payer_membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE e.room_id = %s
            ORDER BY e.created_at DESC
        """
        
        expenses_data = run_sql(sql, (room_id,))
        expenses = []
        
        for expense_row in expenses_data:
            splits_sql = """
                SELECT es.split_id, es.expense_id, es.membership_id, es.amount_owed, es.is_paid, es.paid_at,
                       u.name as member_name
                FROM expense_split es
                JOIN room_membership rm ON es.membership_id = rm.membership_id
                JOIN "user" u ON rm.user_id = u.user_id
                WHERE es.expense_id = %s
                ORDER BY u.name
            """
            
            splits_data = run_sql(splits_sql, (expense_row[0],))
            splits = [
                {
                    "split_id": split[0],
                    "expense_id": split[1],
                    "membership_id": split[2],
                    "amount_owed": float(split[3]),
                    "is_paid": split[4],
                    "paid_at": split[5],
                    "member_name": split[6]
                }
                for split in splits_data
            ]
            
            expense = {
                "expense_id": expense_row[0],
                "room_id": expense_row[1],
                "payer_membership_id": expense_row[2],
                "payer_name": expense_row[3],
                "amount": float(expense_row[4]),
                "description": expense_row[5],
                "category": expense_row[6],
                "expense_date": expense_row[7],
                "receipt_url": expense_row[8],
                "created_at": expense_row[9],
                "splits": splits
            }
            expenses.append(expense)
        
        return expenses
    
    def get_expense_by_id(self, expense_id: int) -> Optional[ExpenseWithSplits]:
        sql = """
            SELECT 
                e.expense_id, e.room_id, e.payer_membership_id, u.name as payer_name,
                e.amount, e.description, e.category, e.expense_date, e.receipt_url, e.created_at
            FROM expense e
            JOIN room_membership rm ON e.payer_membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE e.expense_id = %s
        """
        
        expense_data = run_sql(sql, (expense_id,))
        if not expense_data:
            return None
        
        expense_row = expense_data[0]
        
        splits_sql = """
            SELECT es.split_id, es.expense_id, es.membership_id, es.amount_owed, es.is_paid, es.paid_at,
                   u.name as member_name
            FROM expense_split es
            JOIN room_membership rm ON es.membership_id = rm.membership_id
            JOIN "user" u ON rm.user_id = u.user_id
            WHERE es.expense_id = %s
            ORDER BY u.name
        """
        
        splits_data = run_sql(splits_sql, (expense_id,))
        splits = [
            {
                "split_id": split[0],
                "expense_id": split[1],
                "membership_id": split[2],
                "amount_owed": float(split[3]),
                "is_paid": split[4],
                "paid_at": split[5],
                "member_name": split[6]
            }
            for split in splits_data
        ]
        
        return {
            "expense_id": expense_row[0],
            "room_id": expense_row[1],
            "payer_membership_id": expense_row[2],
            "payer_name": expense_row[3],
            "amount": float(expense_row[4]),
            "description": expense_row[5],
            "category": expense_row[6],
            "expense_date": expense_row[7],
            "receipt_url": expense_row[8],
            "created_at": expense_row[9],
            "splits": splits
        }
    
    def mark_split_as_paid(self, payment: ExpensePaymentRequest):
        """Mark a split as paid"""
        sql = """
            UPDATE expense_split 
            SET is_paid = TRUE, paid_at = %s
            WHERE split_id = %s AND membership_id = %s
        """
        params = (datetime.now(timezone.utc), payment.split_id, payment.membership_id)
        run_sql(sql, params)
        return {"success": True, "message": "Payment recorded successfully"}
    
    def get_user_expenses_summary(self, membership_id: int, room_id: int):
        owes_sql = """
            SELECT COALESCE(SUM(amount_owed), 0) as total_owed
            FROM expense_split es
            JOIN expense e ON es.expense_id = e.expense_id
            WHERE es.membership_id = %s AND e.room_id = %s AND es.is_paid = FALSE
        """
        owes_result = run_sql(owes_sql, (membership_id, room_id))
        total_owed = float(owes_result[0][0]) if owes_result else 0.0
        
        owed_sql = """
            SELECT COALESCE(SUM(es.amount_owed), 0) as total_owed_to_user
            FROM expense_split es
            JOIN expense e ON es.expense_id = e.expense_id
            WHERE e.payer_membership_id = %s AND e.room_id = %s 
            AND es.membership_id != %s AND es.is_paid = FALSE
        """
        owed_result = run_sql(owed_sql, (membership_id, room_id, membership_id))
        total_owed_to_user = float(owed_result[0][0]) if owed_result else 0.0
        
        return {
            "total_owed": total_owed,
            "total_owed_to_user": total_owed_to_user,
            "net_balance": total_owed_to_user - total_owed
        }
    
    def update_expense(self, expense: ExpenseUpdateRequest):
        # First, update the expense record
        expense_sql = """
            UPDATE expense 
            SET payer_membership_id = %s, amount = %s, description = %s, category = %s, expense_date = %s, receipt_url = %s
            WHERE expense_id = %s
        """
        params = (
            expense.payer_membership_id,
            expense.amount,
            expense.description,
            expense.category,
            expense.expense_date,
            expense.receipt_url,
            expense.expense_id
        )
        
        run_sql(expense_sql, params)
        
        # Delete existing splits
        delete_splits_sql = "DELETE FROM expense_split WHERE expense_id = %s"
        run_sql(delete_splits_sql, (expense.expense_id,))
        
        # Create new splits
        total_people = len(expense.split_with)
        if total_people == 0:
            raise ValueError("Must specify at least one person to split with")
        
        amount_per_person = expense.amount / total_people
        
        for membership_id in expense.split_with:
            split_sql = """
                INSERT INTO expense_split (expense_id, membership_id, amount_owed, is_paid, paid_at)
                VALUES (%s, %s, %s, %s, %s)
            """
            # If the payer is in the split list, mark them as already paid
            is_paid = membership_id == expense.payer_membership_id
            paid_at = datetime.now(timezone.utc) if is_paid else None
            
            split_params = (expense.expense_id, membership_id, amount_per_person, is_paid, paid_at)
            run_sql(split_sql, split_params)
        
        return {"expense_id": expense.expense_id, "amount_per_person": float(amount_per_person)}
    
    def delete_expense(self, expense_id: int):
        # Delete splits first (due to foreign key constraint)
        delete_splits_sql = "DELETE FROM expense_split WHERE expense_id = %s"
        run_sql(delete_splits_sql, (expense_id,))
        
        # Delete the expense
        delete_expense_sql = "DELETE FROM expense WHERE expense_id = %s"
        result = run_sql(delete_expense_sql, (expense_id,))
        
        if not result:
            raise ValueError(f"Expense with ID {expense_id} not found")
        
        return {"success": True}
