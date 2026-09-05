from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_facilities():
    return {"success": True, "message": "Facilities endpoint scaffolded", "data": []}
