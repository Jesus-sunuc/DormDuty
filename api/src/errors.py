from functools import wraps
import pprint
import traceback
import inspect

from fastapi import HTTPException

def error_handler(error_message: str):
    def decorator(func):
        if inspect.iscoroutinefunction(func):
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    print(f"\nError in async function '{func.__name__}':")
                    print("Arguments (args):")
                    pprint.pprint(args)
                    pprint.pprint(f"{error_message}: {e}")
                    traceback.print_exc()
                    raise HTTPException(status_code=500, detail=error_message)
            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"\nError in sync function '{func.__name__}':")
                    print("Arguments (args):")
                    pprint.pprint(args)
                    pprint.pprint(f"{error_message}: {e}")
                    traceback.print_exc()
                    raise HTTPException(status_code=500, detail=error_message)
            return sync_wrapper

    return decorator
