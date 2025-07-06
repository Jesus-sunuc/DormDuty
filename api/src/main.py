from dotenv import load_dotenv

from src.router import users_router
from src.router import rooms_router
from src.router import membership_router
from src.router import chores_router
from src.router import expense_router


load_dotenv()

import logging
from fastapi import FastAPI, APIRouter

app = FastAPI()

logging.getLogger("uvicorn.access").addFilter(lambda _: False)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return True


router.include_router(chores_router.router)
router.include_router(membership_router.router)
router.include_router(rooms_router.router)
router.include_router(users_router.router)
router.include_router(expense_router.router)

app.include_router(router)

