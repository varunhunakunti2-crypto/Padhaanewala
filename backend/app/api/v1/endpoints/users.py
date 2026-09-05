from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_users():
    return {"success": True, "message": "Users endpoint scaffolded", "data": []}
