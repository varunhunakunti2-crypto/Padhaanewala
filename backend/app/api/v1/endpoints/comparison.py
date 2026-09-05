from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_comparison():
    return {"success": True, "message": "Comparison endpoint scaffolded", "data": []}
