from fastapi import APIRouter
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/", response_model=ResponseModel)
async def get_mock_tests():
    return {"success": True, "message": "Mock_tests endpoint scaffolded", "data": []}
