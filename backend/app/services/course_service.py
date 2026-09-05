import re
import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, String, Integer, Float
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.services.base import BaseService
from app.models.education import Course, College, CollegeCourse
from app.models.system import Location
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead, CourseDetail, CourseCollegeSummary

def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"&", "and", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s

class CourseRepository:
    """Mock repository for BaseService compatibility"""
    def __init__(self, model):
        self.model = model

    async def get(self, session: AsyncSession, id: uuid.UUID) -> Optional[Course]:
        return await session.get(self.model, id)

    async def update(self, session: AsyncSession, *, db_obj: Course, obj_in: dict) -> Course:
        for key, value in obj_in.items():
            setattr(db_obj, key, value)
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def delete(self, session: AsyncSession, *, id: uuid.UUID) -> Course:
        obj = await session.get(self.model, id)
        await session.delete(obj)
        await session.commit()
        return obj

course_repository = CourseRepository(Course)


class CourseService(BaseService[Course, CourseCreate, CourseUpdate]):
    async def _ensure_unique_slug(self, session: AsyncSession, name: str, exclude_id: uuid.UUID | None = None) -> str:
        base_slug = slugify(name)
        if not base_slug:
            base_slug = f"course-{uuid.uuid4().hex[:8]}"
        slug = base_slug
        counter = 1
        while True:
            query = select(Course).where(Course.slug == slug)
            if exclude_id is not None:
                query = query.where(Course.id != exclude_id)
            result = await session.execute(query)
            if result.scalars().first() is None:
                return slug
            counter += 1
            slug = f"{base_slug}-{counter}"

    async def create(self, session: AsyncSession, obj_in: CourseCreate) -> CourseRead:
        data = obj_in.model_dump(exclude_unset=True)
        if not data.get("slug"):
            data["slug"] = await self._ensure_unique_slug(session, data["name"])
        else:
            data["slug"] = await self._ensure_unique_slug(session, data["slug"])

        obj = Course(**data)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return CourseRead.model_validate(obj)

    async def update(self, session: AsyncSession, id: uuid.UUID, obj_in: CourseUpdate) -> CourseRead:
        db_obj = await self.get_or_404(session, id)
        data = obj_in.model_dump(exclude_unset=True)

        if "name" in data and ("slug" not in data or not data["slug"]):
            data["slug"] = await self._ensure_unique_slug(session, data["name"], exclude_id=id)
        if "slug" in data and data["slug"]:
            data["slug"] = await self._ensure_unique_slug(session, data["slug"], exclude_id=id)

        obj = await self.repository.update(session, db_obj=db_obj, obj_in=data)
        return CourseRead.model_validate(obj)

    async def get_by_slug_or_404(self, session: AsyncSession, slug: str) -> Course:
        result = await session.execute(select(Course).where(Course.slug == slug, Course.deleted_at.is_(None)))
        obj = result.scalars().first()
        if not obj:
            raise HTTPException(status_code=404, detail="Course not found")
        return obj

    async def get_detail(self, session: AsyncSession, slug: str) -> CourseDetail:
        course = await self.get_by_slug_or_404(session, slug)
        if not course.is_published:
            raise HTTPException(status_code=404, detail="Course not found")

        detail = CourseDetail.model_validate(course)

        # Get colleges offering this course
        # Note: In `CollegeCourse`, fee mapping might not be direct. Using `Fee` model or assuming it's absent
        # For simplicity, we just fetch colleges
        cc_result = await session.execute(
            select(College)
            .join(CollegeCourse, College.id == CollegeCourse.college_id)
            .where(CollegeCourse.course_id == course.id, College.is_published == True)
        )
        colleges = []
        for c in cc_result.scalars().all():
            city, state = None, None
            if c.location_id:
                loc = await session.get(Location, c.location_id)
                if loc:
                    city = loc.city
                    state = loc.state
            colleges.append(CourseCollegeSummary(
                id=c.id,
                slug=c.slug,
                name=c.name,
                city=city,
                state=state,
                college_type=c.college_type,
                is_private=c.is_private,
                min_fee=None, # Fee is handled via `Fee` model, keeping null for simplicity
                rating=c.rating
            ))

        detail.colleges = colleges
        detail.colleges_count = len(colleges)
        return detail

    async def list_published(self, session: AsyncSession) -> list[CourseRead]:
        result = await session.execute(select(Course).where(Course.is_published == True, Course.deleted_at.is_(None)).order_by(Course.name.asc()))
        return [CourseRead.model_validate(c) for c in result.scalars().all()]


course_service = CourseService(course_repository)
