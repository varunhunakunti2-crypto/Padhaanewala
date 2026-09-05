from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_enquiries():
    return {"success": True, "message": "Enquiries endpoint scaffolded", "data": []}
