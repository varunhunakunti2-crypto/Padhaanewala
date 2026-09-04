from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel
from app.schemas.college import SearchSuggestions
from app.services.college_service import college_service

router = APIRouter()


@router.get("/suggestions", response_model=ResponseModel[SearchSuggestions])
async def read_search_suggestions(
    session: AsyncSession = Depends(get_db),
    q: str = Query(..., min_length=1, max_length=100, description="Autocomplete query"),
    limit: int = Query(5, ge=1, le=10, description="Results per entity type"),
) -> Any:
    """Autocomplete suggestions across colleges, courses, exams and locations."""
    suggestions = await college_service.get_suggestions(session, q=q, limit=limit)
    return ResponseModel(data=suggestions)