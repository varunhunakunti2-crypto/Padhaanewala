from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_analytics():
    return {"success": True, "message": "Analytics endpoint scaffolded", "data": []}
