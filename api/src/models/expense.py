from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class ExpenseCreateRequest(BaseModel):
    room_id: int
    payer_membership_id: int
    amount: Decimal
    description: str
    category: Optional[str] = None
    expense_date: date
    receipt_url: Optional[str] = None
    split_with: List[int]

class ExpenseUpdateRequest(BaseModel):
    expense_id: int
    room_id: int
    payer_membership_id: int
    amount: Decimal
    description: str
    category: Optional[str] = None
    expense_date: date
    receipt_url: Optional[str] = None
    split_with: List[int]

class Expense(BaseModel):
    expense_id: int
    room_id: int
    payer_membership_id: int
    amount: Decimal
    description: str
    category: Optional[str] = None
    expense_date: date
    receipt_url: Optional[str] = None
    created_at: datetime

class ExpenseSplit(BaseModel):
    split_id: int
    expense_id: int
    membership_id: int
    amount_owed: Decimal
    is_paid: bool = False
    paid_at: Optional[datetime] = None

class ExpenseWithSplits(BaseModel):
    expense_id: int
    room_id: int
    payer_membership_id: int
    payer_name: str
    amount: Decimal
    description: str
    category: Optional[str] = None
    expense_date: date
    receipt_url: Optional[str] = None
    created_at: datetime
    splits: List[ExpenseSplit]
    
class ExpensePaymentRequest(BaseModel):
    split_id: int
    membership_id: int
