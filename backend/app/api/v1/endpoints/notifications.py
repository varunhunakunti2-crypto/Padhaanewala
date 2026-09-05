from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_notifications():
    return {"success": True, "message": "Notifications endpoint scaffolded", "data": []}
