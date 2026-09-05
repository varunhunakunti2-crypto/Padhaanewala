from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_dashboard():
    return {"success": True, "message": "Dashboard endpoint scaffolded", "data": []}
