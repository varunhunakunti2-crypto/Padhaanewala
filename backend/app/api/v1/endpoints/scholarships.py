from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel, PaginatedResponse
from app.schemas.scholarship import ScholarshipRead, ScholarshipDetail, ScholarshipFacets
from app.services.scholarship_service import scholarship_service

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ScholarshipRead])
async def public_list_scholarships(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by scholarship name"),
    course: str | None = Query(None, description="Filter by course name"),
    state: str | None = Query(None, description="Filter by state"),
    govt: bool | None = Query(None, description="True = government, False = private"),
    status: str | None = Query(None, description="active / expired / draft"),
    upcoming: bool | None = Query(None, description="Only not-yet-expired deadlines"),
    min_amount: float | None = Query(None, ge=0),
) -> Any:
    """Public scholarship finder list — only published (active/expired) records."""
    paginated = await scholarship_service.get_paginated(
        session,
        page=page, size=size, search=search, course=course, state=state,
        govt=govt, status_filter=status, upcoming_only=upcoming,
        min_amount=min_amount, only_published=True,
    )
    return PaginatedResponse(data=paginated)


@router.get("/facets", response_model=ResponseModel[ScholarshipFacets])
async def public_scholarship_facets(
    session: AsyncSession = Depends(get_db),
) -> Any:
    facets = await scholarship_service.get_facets(session)
    return ResponseModel(data=facets)


@router.get("/by-slug/{slug}", response_model=ResponseModel[ScholarshipRead])
async def get_scholarship_by_slug(
    session: AsyncSession = Depends(get_db),
    slug: str = ...,
) -> Any:
    read = await scholarship_service.get_detail(session, slug)
    return ResponseModel(data=read)


@router.get("/{id}", response_model=ResponseModel[ScholarshipRead])
async def get_scholarship_by_id(
    session: AsyncSession = Depends(get_db),
    id: str = ...,
) -> Any:
    read = await scholarship_service.get_detail(session, id)
    return ResponseModel(data=read)