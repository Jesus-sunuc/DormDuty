from fastapi import APIRouter, Depends
from src.repository.chores_repository import ChoreRepository
from src.errors import error_handler

router = APIRouter(
    prefix="/chores",
    tags=["Chores"],
    responses={404: {"description": "Chores endpoint not found"}},
)

@router.get("/all")
@error_handler("Error fetching all chores")
def get_chores():
    repo = ChoreRepository()
    return repo.get_all_chores()
