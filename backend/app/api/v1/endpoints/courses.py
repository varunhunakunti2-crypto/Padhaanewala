from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_db
from app.schemas.common import ResponseModel
from app.schemas.course import CourseRead, CourseDetail
from app.services.course_service import course_service

router = APIRouter()

@router.get("/", response_model=ResponseModel[list[CourseRead]])
async def list_courses(session: AsyncSession = Depends(get_db)) -> Any:
    """List all published courses."""
    courses = await course_service.list_published(session)
    return ResponseModel(message="Courses loaded", data=courses)

@router.get("/{slug}", response_model=ResponseModel[CourseDetail])
async def get_course_detail(slug: str, session: AsyncSession = Depends(get_db)) -> Any:
    """Get full details of a course by slug."""
    course = await course_service.get_detail(session, slug)
    return ResponseModel(message="Course loaded", data=course)
