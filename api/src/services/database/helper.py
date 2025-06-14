from psycopg_pool import ConnectionPool
from psycopg.rows import class_row
import os
from typing import List, Optional, TypeVar, Type

T = TypeVar("T")

# Load credentials from .env
pg_user = os.getenv("POSTGRES_USER")
pg_password = os.getenv("POSTGRES_PASSWORD")
pg_host = os.getenv("POSTGRES_HOST")
pg_db = os.getenv("POSTGRES_DB")

# Initialize connection pool
pool = ConnectionPool(
    f"password={pg_password} user={pg_user} host={pg_host} dbname={pg_db}",
    open=True,
    check=ConnectionPool.check_connection,
)
pool.wait(timeout=6.0)

# Generic query runner
def run_sql(sql, params=None, output_class: Optional[Type[T]] = None) -> List[T]:
    try:
        with pool.connection() as connection:
            with (
                connection.cursor(row_factory=class_row(output_class))
                if output_class is not None
                else connection.cursor()
            ) as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall() if cursor.description is not None else []
    except Exception as e:
        print(sql)
        print(params)
        raise
