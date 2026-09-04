from typing import Any
from pydantic import UUID4
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel, PaginatedResponse
from app.schemas.college import CollegeCreate, CollegeUpdate, CollegeRead, CollegeDetail
from app.services.college_service import college_service

router = APIRouter()


@router.post("/", response_model=ResponseModel[CollegeRead], status_code=status.HTTP_201_CREATED)
async def create_college(
    *,
    session: AsyncSession = Depends(get_db),
    college_in: CollegeCreate,
) -> Any:
    """Create new college."""
    college = await college_service.create(session, obj_in=college_in)
    return ResponseModel(data=college)


@router.get("/", response_model=PaginatedResponse[CollegeRead])
async def read_colleges(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    search: str | None = Query(None, description="Search by college name"),
    course: str | None = Query(None, description="Filter by course name"),
    state: str | None = Query(None, description="Filter by state"),
    district: str | None = Query(None, description="Filter by district"),
    city: str | None = Query(None, description="Filter by city"),
    college_type: str | None = Query(None, description="e.g. dental, medical, engineering"),
    is_private: bool | None = Query(None, description="True = private, False = government"),
    university: str | None = Query(None, description="Filter by university name"),
    min_fee: float | None = Query(None, ge=0, description="Minimum fee"),
    max_fee: float | None = Query(None, ge=0, description="Maximum fee"),
    has_hostel: bool | None = Query(None, description="Has hostel"),
    rating: float | None = Query(None, ge=1, le=5, description="Minimum rating"),
    accreditation: str | None = Query(None, description="e.g. NAAC A"),
    admission_status: str | None = Query(None, description="open / closed / tentative"),
    is_published: bool | None = Query(None, description="Only published colleges (public)" ),
) -> Any:
    """Retrieve colleges with pagination, filters and search."""
    # Public listing: only published colleges are shown.
    published_filter = True if is_published is None else is_published
    paginated_data = await college_service.get_paginated(
        session,
        page=page,
        size=size,
        search=search,
        course=course,
        state=state,
        district=district,
        city=city,
        college_type=college_type,
        is_private=is_private,
        university=university,
        min_fee=min_fee,
        max_fee=max_fee,
        has_hostel=has_hostel,
        rating=rating,
        accreditation=accreditation,
        admission_status=admission_status,
        is_published=published_filter,
    )
    return PaginatedResponse(data=paginated_data)


@router.get("/by-slug/{slug}", response_model=ResponseModel[CollegeRead])
async def read_college_by_slug(
    *,
    session: AsyncSession = Depends(get_db),
    slug: str,
) -> Any:
    """Get college by SEO slug."""
    college = await college_service.get_by_slug_or_404(session, slug)
    return ResponseModel(data=college)


@router.get("/detail/{slug}", response_model=ResponseModel[CollegeDetail])
async def read_college_detail(
    *,
    session: AsyncSession = Depends(get_db),
    slug: str,
) -> Any:
    """Full college detail for the public detail page (courses, fees,
    facilities, reviews, FAQs, cutoffs, gallery, admission info)."""
    detail = await college_service.get_detail(session, slug)
    return ResponseModel(data=detail)


@router.get("/{id}", response_model=ResponseModel[CollegeRead])
async def read_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
) -> Any:
    """Get college by ID."""
    college = await college_service.get_or_404(session, id)
    return ResponseModel(data=college)


@router.put("/{id}", response_model=ResponseModel[CollegeRead])
async def update_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
    college_in: CollegeUpdate,
) -> Any:
    """Update a college."""
    college = await college_service.update(session, id=id, obj_in=college_in)
    return ResponseModel(data=college)


@router.delete("/{id}", response_model=ResponseModel[CollegeRead])
async def delete_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
) -> Any:
    """Delete a college (soft delete)."""
    college = await college_service.delete(session, id=id)
    return ResponseModel(data=college)