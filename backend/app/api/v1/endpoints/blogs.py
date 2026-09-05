from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_blogs():
    return {"success": True, "message": "Blogs endpoint scaffolded", "data": []}
