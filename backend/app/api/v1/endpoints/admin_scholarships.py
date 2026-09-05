from typing import Any

from pydantic import UUID4
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.api.deps import RoleChecker
from app.schemas.common import ResponseModel, PaginatedResponse
from app.schemas.scholarship import (
    ScholarshipCreate,
    ScholarshipUpdate,
    ScholarshipRead,
    ScholarshipVerifyUpdate,
)
from app.services.scholarship_service import scholarship_service

router = APIRouter()

allow_admin = RoleChecker(["SUPER_ADMIN", "CONTENT_ADMIN"])


@router.get("/", response_model=PaginatedResponse[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_list_scholarships(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    course: str | None = Query(None),
    state: str | None = Query(None),
    govt: bool | None = Query(None),
    status: str | None = Query(None),
    verification_status: str | None = Query(None),
) -> Any:
    paginated = await scholarship_service.get_paginated(
        session, page=page, size=size, search=search, course=course, state=state,
        govt=govt, status_filter=status, only_published=False,
    )
    return PaginatedResponse(data=paginated)


@router.post("/", response_model=ResponseModel[ScholarshipRead], status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin)])
async def admin_create_scholarship(
    session: AsyncSession = Depends(get_db),
    scholarship_in: ScholarshipCreate = ...,
) -> Any:
    created = await scholarship_service.create(session, obj_in=scholarship_in)
    return ResponseModel(data=created)


@router.get("/{id}", response_model=ResponseModel[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_get_scholarship(
    id: UUID4,
    session: AsyncSession = Depends(get_db),
) -> Any:
    read = await scholarship_service.get_detail(session, str(id))
    return ResponseModel(data=read)


@router.put("/{id}", response_model=ResponseModel[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_update_scholarship(
    id: UUID4,
    scholarship_in: ScholarshipUpdate,
    session: AsyncSession = Depends(get_db),
) -> Any:
    updated = await scholarship_service.update(session, id=id, obj_in=scholarship_in)
    return ResponseModel(data=updated)


@router.delete("/{id}", response_model=ResponseModel[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_delete_scholarship(
    id: UUID4,
    session: AsyncSession = Depends(get_db),
) -> Any:
    deleted = await scholarship_service.delete(session, id=id)
    return ResponseModel(data=deleted)


@router.patch("/{id}/status", response_model=ResponseModel[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_scholarship_status(
    id: UUID4,
    status: str = Query(..., description="active / expired / draft"),
    session: AsyncSession = Depends(get_db),
) -> Any:
    updated = await scholarship_service.publish(session, id=id, status_value=status)
    return ResponseModel(data=updated)


@router.patch("/{id}/verify", response_model=ResponseModel[ScholarshipRead], dependencies=[Depends(allow_admin)])
async def admin_scholarship_verify(
    id: UUID4,
    body: ScholarshipVerifyUpdate,
    session: AsyncSession = Depends(get_db),
) -> Any:
    updated = await scholarship_service.verify(
        session, id=id, verification_status=body.verification_status,
        last_verified_at=body.last_verified_at,
    )
    return ResponseModel(data=updated)