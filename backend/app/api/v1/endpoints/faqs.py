from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_faqs():
    return {"success": True, "message": "Faqs endpoint scaffolded", "data": []}
