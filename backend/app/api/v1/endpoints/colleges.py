from typing import Any
from pydantic import UUID4
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.schemas.common import ResponseModel, PaginatedResponse
from app.schemas.college import CollegeCreate, CollegeUpdate, CollegeRead
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
    search: str | None = Query(None, description="Search by college name")
) -> Any:
    """Retrieve colleges with pagination and optional search."""
    paginated_data = await college_service.get_paginated(session, page=page, size=size, search=search)
    return PaginatedResponse(data=paginated_data)

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
    """Delete a college."""
    college = await college_service.delete(session, id=id)
    return ResponseModel(data=college)
