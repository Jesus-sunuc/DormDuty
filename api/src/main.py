import os
from dotenv import load_dotenv

from src.router import announcement_reaction_router, announcement_reply_router, announcement_reply_reaction_router, announcement_read_router
from src.router import users_router
from src.router import rooms_router
from src.router import membership_router
from src.router import chores_router
from src.router import chore_swap_request_router
from src.router import expense_router
from src.router import announcement_router
from src.router import cleaning_router

env = os.getenv("ENVIRONMENT", "development")

if env == "development":
    load_dotenv(".env.dev")
elif env == "preview":
    load_dotenv(".env.prev")
elif env == "production":
    load_dotenv(".env.prod")

import logging
from fastapi import FastAPI, APIRouter

app = FastAPI()

logging.getLogger("uvicorn.access").addFilter(lambda _: False)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return True


router.include_router(chores_router.router)
router.include_router(chore_swap_request_router.router)
router.include_router(membership_router.router)
router.include_router(rooms_router.router)
router.include_router(users_router.router)
router.include_router(expense_router.router)
router.include_router(announcement_router.router)
router.include_router(announcement_reply_router.router)
router.include_router(announcement_reaction_router.router)
router.include_router(announcement_reply_reaction_router.router)
router.include_router(announcement_read_router.router)
router.include_router(cleaning_router.router)

app.include_router(router)

