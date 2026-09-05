import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # We can add request_id to context variables for logger here if using structlog/contextvars
        # For now, we just pass it along
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
