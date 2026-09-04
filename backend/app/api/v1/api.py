from fastapi import APIRouter
from app.api.v1.endpoints import colleges

api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
