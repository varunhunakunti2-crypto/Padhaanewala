from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_locations():
    return {"success": True, "message": "Locations endpoint scaffolded", "data": []}
