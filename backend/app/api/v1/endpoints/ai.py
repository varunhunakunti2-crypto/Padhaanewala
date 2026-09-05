from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel
from app.schemas.comparison import AICompareRequest, AICompareResponse
from app.services.comparison_service import comparison_service

router = APIRouter()


@router.post("/compare", response_model=ResponseModel[AICompareResponse])
async def ai_compare_colleges(
    *,
    session: AsyncSession = Depends(get_db),
    request: AICompareRequest,
) -> Any:
    """Rules-based "which college is better for me?" analysis.

    Uses only verified database fields. Never claims guaranteed admission;
    the response always carries an estimate disclaimer.
    """
    data = await comparison_service.ai_compare(session, request)
    return ResponseModel(message="AI comparison ready", data=data)