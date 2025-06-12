# from dotenv import load_dotenv


# load_dotenv()

# import logging
# from fastapi import FastAPI, APIRouter


# app = FastAPI()


# logging.getLogger("uvicorn.access").addFilter(lambda _: False)


# router = APIRouter(prefix="/api")


# @router.get("/health")
# def health_check():
#     return True


# app.include_router(router)


import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter

# 1. Load the correct .env file based on ENV_FILE or ENV
env_file = os.getenv("ENV_FILE", ".env.docker")  # Default to local dev
load_dotenv(dotenv_path=env_file)

# 2. Set up FastAPI
app = FastAPI()

# 3. Optional: silence uvicorn.access logs
logging.getLogger("uvicorn.access").addFilter(lambda _: False)

# 4. Set up router
router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return {"status": "ok"}  # More descriptive than True

app.include_router(router)

logging.info(f"Loaded environment from {env_file}")

