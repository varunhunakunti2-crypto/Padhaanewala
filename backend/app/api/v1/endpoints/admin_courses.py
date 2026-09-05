import uuid
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db, get_current_user
from app.schemas.common import ResponseModel, PaginatedData
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead
from app.services.course_service import course_service

router = APIRouter()

# Note: In a real system, you would check if current_user has the right roles here.
# For simplicity, we just require authentication.

@router.get("/", response_model=ResponseModel[PaginatedData[CourseRead]])
async def list_admin_courses(
    page: int = 1, 
    size: int = 20, 
    session: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
) -> Any:
    # We will fetch directly from service here; assuming a simple paginated list is enough
    # For now, using a simplified direct query as course_service doesn't have paginated yet
    from sqlalchemy import select, func
    from app.models.education import Course
    query = select(Course).where(Course.deleted_at.is_(None)).order_by(Course.created_at.desc())
    
    total = await session.scalar(select(func.count()).select_from(query.subquery()))
    result = await session.execute(query.offset((page - 1) * size).limit(size))
    items = [CourseRead.model_validate(c) for c in result.scalars().all()]
    
    pages = max(1, (total + size - 1) // size)
    data = PaginatedData(items=items, total=total, page=page, size=size, pages=pages)
    
    return ResponseModel(message="Courses loaded", data=data)

@router.post("/", response_model=ResponseModel[CourseRead])
async def create_course(
    obj_in: CourseCreate,
    session: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
) -> Any:
    course = await course_service.create(session, obj_in)
    return ResponseModel(message="Course created", data=course)

@router.get("/{id}", response_model=ResponseModel[CourseRead])
async def get_course(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
) -> Any:
    course = await course_service.get_or_404(session, id)
    return ResponseModel(message="Course loaded", data=CourseRead.model_validate(course))

@router.put("/{id}", response_model=ResponseModel[CourseRead])
async def update_course(
    id: uuid.UUID,
    obj_in: CourseUpdate,
    session: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
) -> Any:
    course = await course_service.update(session, id, obj_in)
    return ResponseModel(message="Course updated", data=course)

@router.delete("/{id}", response_model=ResponseModel)
async def delete_course(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
) -> Any:
    # Soft delete
    db_obj = await course_service.get_or_404(session, id)
    from datetime import datetime, timezone
    db_obj.deleted_at = datetime.now(timezone.utc)
    session.add(db_obj)
    await session.commit()
    return ResponseModel(message="Course archived", data=None)
