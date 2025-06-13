import os
import asyncpg

async def get_connection():
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB")
    sslmode = os.getenv("POSTGRES_SSLMODE", "require")

    dsn = f"postgresql://{user}:{password}@{host}:{port}/{db}?sslmode={sslmode}"
    
    return await asyncpg.connect(dsn)
