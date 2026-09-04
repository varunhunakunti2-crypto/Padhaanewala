from typing import Any, List
from pydantic import UUID4
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.api.deps import RoleChecker
from app.models.user import User
from app.schemas.common import ResponseModel, PaginatedResponse
from app.schemas.college import (
    CollegeCreate,
    CollegeUpdate,
    CollegeRead,
    CollegePublishUpdate,
    CollegeVerifyUpdate,
)
from app.services.college_service import college_service

router = APIRouter()

allow_content_admin = RoleChecker(["SUPER_ADMIN", "CONTENT_ADMIN"])


@router.get(
    "/",
    response_model=PaginatedResponse[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_list_colleges(
    *,
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
) -> Any:
    """List all colleges including unpublished (admin)."""
    paginated = await college_service.get_paginated(
        session, page=page, size=size, search=search, is_published=None
    )
    return PaginatedResponse(data=paginated)


@router.post(
    "/",
    response_model=ResponseModel[CollegeRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_content_admin)],
)
async def admin_create_college(
    *,
    session: AsyncSession = Depends(get_db),
    college_in: CollegeCreate,
) -> Any:
    """Create a college (admin)."""
    college = await college_service.create(session, obj_in=college_in)
    return ResponseModel(data=college)


@router.get(
    "/{id}",
    response_model=ResponseModel[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_get_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
) -> Any:
    """Get a college by id (admin)."""
    college = await college_service.get_or_404(session, id)
    return ResponseModel(data=college)


@router.put(
    "/{id}",
    response_model=ResponseModel[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_update_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
    college_in: CollegeUpdate,
) -> Any:
    """Update a college (admin)."""
    college = await college_service.update(session, id=id, obj_in=college_in)
    return ResponseModel(data=college)


@router.delete(
    "/{id}",
    response_model=ResponseModel[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_delete_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
) -> Any:
    """Soft-delete / archive a college (admin)."""
    college = await college_service.delete(session, id=id)
    return ResponseModel(data=college)


@router.patch(
    "/{id}/publish",
    response_model=ResponseModel[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_publish_college(
    *,
    session: AsyncSession = Depends(get_db),
    id: UUID4,
    publish_in: CollegePublishUpdate,
) -> Any:
    """Publish / unpublish a college (admin)."""
    college = await college_service.publish(session, id=id, obj_in=publish_in)
    return ResponseModel(message="Publish status updated", data=college)


@router.patch(
    "/{id}/verify",
    response_model=ResponseModel[CollegeRead],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_verify_college(
    *,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_content_admin),
    id: UUID4,
    verify_in: CollegeVerifyUpdate,
) -> Any:
    """Set verification status for a college (admin)."""
    college = await college_service.verify(
        session, id=id, obj_in=verify_in, verified_by=current_user.id
    )
    return ResponseModel(message="Verification updated", data=college)


@router.post(
    "/bulk/archive",
    response_model=ResponseModel[dict],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_bulk_archive(
    *,
    session: AsyncSession = Depends(get_db),
    ids: List[UUID4],
) -> Any:
    """Archive multiple colleges (admin)."""
    count = await college_service.bulk_archive(session, ids=ids)
    return ResponseModel(message=f"{count} college(s) archived", data={"archived": count})