from functools import wraps
import pprint
import traceback

from fastapi import HTTPException


def error_handler(error_message: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except ValueError as e:
                print(f"\nError in function '{func.__name__}':")
                print("Arguments (args):")
                pprint.pprint(args)
                pprint.pprint(f"{error_message}: {e}")
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"{error_message}")
            except HTTPException as e:
                print(f"\nError in function '{func.__name__}':")
                print("Arguments (args):")
                pprint.pprint(args)
                pprint.pprint(f"{error_message}: {e}")
                traceback.print_exc()
                raise HTTPException(
                    status_code=500, detail=f"{error_message}"
                )
            except Exception as e:
                print(f"\nError in function '{func.__name__}':")
                print("Arguments (args):")
                pprint.pprint(args)
                pprint.pprint(f"{error_message}: {e}")
                traceback.print_exc()
                raise HTTPException(status_code=500, detail=f"{error_message}")

        return wrapper

    return decorator
