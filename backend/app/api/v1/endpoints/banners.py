from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_banners():
    return {"success": True, "message": "Banners endpoint scaffolded", "data": []}
