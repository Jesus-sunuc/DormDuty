from fastapi import APIRouter, HTTPException, status
from src.repository.expense_repository import ExpenseRepository
from src.models.expense import ExpenseCreateRequest, ExpenseUpdateRequest, ExpensePaymentRequest
from src.errors import error_handler

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
    responses={404: {"description": "Expense endpoint not found"}},
)

repo = ExpenseRepository()

@router.post("/create")
@error_handler("Error creating expense")
def create_expense(expense: ExpenseCreateRequest):
    return repo.create_expense(expense)

@router.get("/room/{room_id}")
@error_handler("Error fetching room expenses")
def get_room_expenses(room_id: int):
    return repo.get_expenses_by_room(room_id)

@router.get("/{expense_id}")
@error_handler("Error fetching expense")
def get_expense_by_id(expense_id: int):
    expense = repo.get_expense_by_id(expense_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found"
        )
    return expense

@router.post("/pay")
@error_handler("Error recording payment")
def mark_split_as_paid(payment: ExpensePaymentRequest):
    return repo.mark_split_as_paid(payment)

@router.get("/summary/user/{membership_id}/room/{room_id}")
@error_handler("Error fetching user expense summary")
def get_user_expense_summary(membership_id: int, room_id: int):
    return repo.get_user_expenses_summary(membership_id, room_id)
