from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_ai():
    return {"success": True, "message": "Ai endpoint scaffolded", "data": []}
