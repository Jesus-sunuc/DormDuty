from dotenv import load_dotenv

load_dotenv()

import logging
from fastapi import FastAPI, APIRouter
app = FastAPI()

logging.getLogger("uvicorn.access").addFilter(lambda _: False)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return True

app.include_router(router)


