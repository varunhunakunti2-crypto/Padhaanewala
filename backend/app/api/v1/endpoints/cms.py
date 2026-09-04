from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel
from app.schemas.homepage import HomepageResponse
from app.services.homepage_service import homepage_service

router = APIRouter()


@router.get("/homepage", response_model=ResponseModel[HomepageResponse])
async def get_homepage(*, session: AsyncSession = Depends(get_db)) -> Any:
    """Assembled public homepage: static CMS sections + live scholarships /
    exams / mock-tests / reviews / articles."""
    data = await homepage_service.assemble(session)
    return ResponseModel(message="Homepage loaded", data=data)