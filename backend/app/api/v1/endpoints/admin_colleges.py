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
    CollegeBulkPublish,
    CollegeBulkVerify,
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
    search: str | None = Query(None, description="Search name / official name / code"),
    state: str | None = Query(None),
    district: str | None = Query(None),
    city: str | None = Query(None),
    college_type: str | None = Query(None),
    is_private: bool | None = Query(None, description="True = private, False = government"),
    university: str | None = Query(None),
    min_fee: float | None = Query(None, ge=0),
    max_fee: float | None = Query(None, ge=0),
    has_hostel: bool | None = Query(None),
    rating: float | None = Query(None, ge=1, le=5),
    accreditation: str | None = Query(None),
    admission_status: str | None = Query(None),
    verification_status: str | None = Query(None, description="unverified / pending / verified"),
    is_published: bool | None = Query(None, description="None = all, True = published only"),
) -> Any:
    """List colleges including unpublished (admin) with full filters."""
    paginated = await college_service.get_paginated(
        session,
        page=page,
        size=size,
        search=search,
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
        verification_status=verification_status,
        is_published=is_published,
    )
    return PaginatedResponse(data=paginated)


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


@router.post(
    "/bulk/publish",
    response_model=ResponseModel[dict],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_bulk_publish(
    *,
    session: AsyncSession = Depends(get_db),
    bulk_in: CollegeBulkPublish,
) -> Any:
    """Publish or unpublish multiple colleges (admin)."""
    action = "published" if bulk_in.is_published else "unpublished"
    count = await college_service.bulk_publish(
        session, ids=bulk_in.ids, is_published=bulk_in.is_published
    )
    return ResponseModel(
        message=f"{count} college(s) {action}",
        data={"updated": count, "is_published": bulk_in.is_published},
    )


@router.post(
    "/bulk/verify",
    response_model=ResponseModel[dict],
    dependencies=[Depends(allow_content_admin)],
)
async def admin_bulk_verify(
    *,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(allow_content_admin),
    bulk_in: CollegeBulkVerify,
) -> Any:
    """Set verification status on multiple colleges (admin)."""
    count = await college_service.bulk_verify(
        session,
        ids=bulk_in.ids,
        verification_status=bulk_in.verification_status,
        last_verified_at=bulk_in.last_verified_at,
        verified_by=current_user.id,
    )
    return ResponseModel(
        message=f"{count} college(s) updated",
        data={"updated": count, "verification_status": bulk_in.verification_status},
    )


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
    read = await college_service.get_read(session, college.id)
    return ResponseModel(data=read)


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
    read = await college_service.get_read(session, id)
    return ResponseModel(data=read)


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
    read = await college_service.get_read(session, id)
    return ResponseModel(data=read)


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
    read = await college_service.publish(session, id=id, obj_in=publish_in)
    return ResponseModel(message="Publish status updated", data=read)


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
    read = await college_service.verify(
        session, id=id, obj_in=verify_in, verified_by=current_user.id
    )
    return ResponseModel(message="Verification updated", data=read)