from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_media():
    return {"success": True, "message": "Media endpoint scaffolded", "data": []}
