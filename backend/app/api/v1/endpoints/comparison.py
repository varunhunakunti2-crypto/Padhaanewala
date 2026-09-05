from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel
from app.schemas.comparison import ComparisonRequest, ComparisonResponse
from app.services.comparison_service import comparison_service

router = APIRouter()


@router.post("/", response_model=ResponseModel[ComparisonResponse])
async def compare_colleges(
    *,
    session: AsyncSession = Depends(get_db),
    request: ComparisonRequest,
) -> Any:
    """Normalized side-by-side comparison for up to 4 published colleges.

    Only fields stored in the verified database are returned. Missing values
    are returned as null/empty - never invented.
    """
    data = await comparison_service.compare(session, request)
    return ResponseModel(message="Comparison ready", data=data)