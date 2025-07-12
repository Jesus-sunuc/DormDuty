from fastapi import APIRouter, Query
from src.repository.cleaning_checklist_repository import CleaningChecklistRepository, CleaningCheckStatusRepository
from src.models.cleaning_checklist import CleaningChecklistCreateRequest, CleaningChecklistUpdateRequest, CleaningCheckStatusCreateRequest, CleaningCheckStatusUnassignRequest
from src.errors import error_handler
from datetime import datetime

router = APIRouter(
    prefix="/cleaning",
    tags=["Cleaning"],
    responses={404: {"description": "Cleaning endpoint not found"}},
)

checklist_repo = CleaningChecklistRepository()
status_repo = CleaningCheckStatusRepository()

@router.get("/room/{room_id}")
@error_handler("Error fetching room checklist")
def get_room_checklist(room_id: int, date_filter: str = Query(None, description="Date in YYYY-MM-DD format")):
    if date_filter is None:
        date_filter = datetime.now().strftime('%Y-%m-%d')
    return checklist_repo.get_checklist_by_room(room_id, date_filter)

@router.post("/add")
@error_handler("Error adding checklist item")
def add_checklist_item(item: CleaningChecklistCreateRequest):
    return checklist_repo.add_checklist_item(item)

@router.put("/{checklist_item_id}/update")
@error_handler("Error updating checklist item")
def update_checklist_item(checklist_item_id: int, item: CleaningChecklistUpdateRequest):
    return checklist_repo.update_checklist_item(checklist_item_id, item)

@router.post("/{checklist_item_id}/delete")
@error_handler("Error deleting checklist item")
def delete_checklist_item(checklist_item_id: int):
    return checklist_repo.delete_checklist_item(checklist_item_id)

@router.post("/room/{room_id}/initialize")
@error_handler("Error initializing room checklist")
def initialize_room_checklist(room_id: int):
    return checklist_repo.create_default_checklist(room_id)

@router.post("/assign")
@error_handler("Error assigning task")
def assign_task(request: CleaningCheckStatusCreateRequest):
    return status_repo.assign_task(request.checklist_item_id, request.membership_id, request.marked_date)

@router.post("/unassign")
@error_handler("Error unassigning task")
def unassign_task(request: CleaningCheckStatusUnassignRequest):
    return status_repo.unassign_task(request.checklist_item_id, request.marked_date)

@router.post("/complete")
@error_handler("Error completing task")
def complete_task(request: CleaningCheckStatusCreateRequest):
    return status_repo.complete_task(request.checklist_item_id, request.membership_id, request.marked_date)

@router.post("/toggle")
@error_handler("Error toggling task status")
def toggle_task_completion(request: CleaningCheckStatusCreateRequest):
    return status_repo.toggle_task(request.checklist_item_id, request.membership_id, request.marked_date)

@router.post("/room/{room_id}/reset")
@error_handler("Error resetting room tasks")
def reset_room_tasks(
    room_id: int,
    marked_date: str = Query(..., description="Date in YYYY-MM-DD format")
):
    return status_repo.reset_room_tasks(room_id, marked_date)

@router.get("/status/room/{room_id}")
@error_handler("Error fetching status history")
def get_status_history(
    room_id: int,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format")
):
    return status_repo.get_status_history(room_id, start_date, end_date)
