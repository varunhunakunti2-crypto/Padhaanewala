from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_scholarships():
    return {"success": True, "message": "Scholarships endpoint scaffolded", "data": []}
