import re
import uuid
from datetime import date
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.scholarships import Scholarship, ScholarshipCourse, ScholarshipState
from app.models.education import Course
from app.schemas.scholarship import (
    ScholarshipCreate,
    ScholarshipUpdate,
    ScholarshipRead,
    ScholarshipDetail,
    ScholarshipFacets,
    ScholarshipFacetBucket,
)
from app.services.base import BaseService
from app.repositories.base import BaseRepository
from app.utils.pagination import paginate
from app.schemas.common import PaginatedData


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"&", "and", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s


class ScholarshipService(BaseService[Scholarship, ScholarshipCreate, ScholarshipUpdate]):
    async def _ensure_unique_slug(self, session: AsyncSession, name: str, exclude_id: Optional[uuid.UUID] = None) -> Optional[str]:
        base = slugify(name)
        if not base:
            return None
        slug = base
        counter = 1
        while True:
            stmt = select(Scholarship).where(Scholarship.slug == slug)
            if exclude_id is not None:
                stmt = stmt.where(Scholarship.id != exclude_id)
            result = await session.execute(stmt)
            if result.scalars().first() is None:
                return slug
            counter += 1
            slug = f"{base}-{counter}"

    async def _sync_courses_states(self, session: AsyncSession, scholarship_id: uuid.UUID, course_ids: List[uuid.UUID], states: List[str]):
        await session.execute(ScholarshipCourse.__table__.delete().where(ScholarshipCourse.scholarship_id == scholarship_id))
        for cid in course_ids:
            session.add(ScholarshipCourse(scholarship_id=scholarship_id, course_id=cid))
        await session.execute(ScholarshipState.__table__.delete().where(ScholarshipState.scholarship_id == scholarship_id))
        for st in states:
            session.add(ScholarshipState(scholarship_id=scholarship_id, state=st))

    async def _to_read(self, session: AsyncSession, s: Scholarship) -> ScholarshipRead:
        read = ScholarshipRead.model_validate(s)
        cids = (await session.execute(
            select(Course).join(ScholarshipCourse, ScholarshipCourse.course_id == Course.id)
            .where(ScholarshipCourse.scholarship_id == s.id)
        )).scalars().all()
        read.course_names = [c.name for c in cids]
        states = (await session.execute(
            select(ScholarshipState).where(ScholarshipState.scholarship_id == s.id)
        )).scalars().all()
        read.states = [st.state for st in states]
        return read

    async def _to_detail(self, session: AsyncSession, s: Scholarship) -> ScholarshipDetail:
        read = await self._to_read(session, s)
        detail = ScholarshipDetail(**read.model_dump())
        cids = (await session.execute(
            select(ScholarshipCourse.course_id).where(ScholarshipCourse.scholarship_id == s.id)
        )).scalars().all()
        detail.course_ids = list(cids)
        return detail

    async def create(self, session: AsyncSession, obj_in: ScholarshipCreate) -> ScholarshipRead:
        data = obj_in.model_dump(exclude_unset=True)
        course_ids = data.pop("course_ids", [])
        states = data.pop("states", [])
        slug = await self._ensure_unique_slug(session, data["name"])
        db_obj = Scholarship(**data, slug=slug)
        session.add(db_obj)
        await session.flush()
        await self._sync_courses_states(session, db_obj.id, course_ids or [], states or [])
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)

    async def update(self, session: AsyncSession, id: uuid.UUID, obj_in: ScholarshipUpdate) -> ScholarshipRead:
        db_obj = await self.get_or_404(session, id)
        data = obj_in.model_dump(exclude_unset=True)
        course_ids = data.pop("course_ids", None)
        states = data.pop("states", None)
        if "name" in data:
            data["slug"] = await self._ensure_unique_slug(session, data["name"], exclude_id=id)
        for field, value in data.items():
            setattr(db_obj, field, value)
        if course_ids is not None or states is not None:
            await self._sync_courses_states(session, db_obj.id, course_ids or [], states or [])
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)

    async def delete(self, session: AsyncSession, id: uuid.UUID) -> ScholarshipRead:
        db_obj = await self.get_or_404(session, id)
        read = await self._to_read(session, db_obj)
        await self.repository.remove(session, id=id)
        return read

    async def get_detail(self, session: AsyncSession, slug: str) -> ScholarshipDetail:
        result = await session.execute(select(Scholarship).where(Scholarship.slug == slug))
        obj = result.scalars().first()
        if not obj or obj.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Scholarship not found")
        return await self._to_detail(session, obj)

    async def get_paginated(
        self, session: AsyncSession, *,
        page: int = 1, size: int = 20,
        search: Optional[str] = None,
        course: Optional[str] = None,
        state: Optional[str] = None,
        govt: Optional[bool] = None,
        status_filter: Optional[str] = None,
        upcoming_only: Optional[bool] = None,
        min_amount: Optional[float] = None,
        only_published: bool = False,
    ) -> PaginatedData[ScholarshipRead]:
        stmt = select(Scholarship).where(Scholarship.deleted_at.is_(None))
        if only_published:
            stmt = stmt.where(Scholarship.status.in_(["active", "expired"]))
        if status_filter:
            stmt = stmt.where(Scholarship.status == status_filter)
        if govt is not None:
            stmt = stmt.where(Scholarship.is_government == govt)
        if min_amount is not None:
            stmt = stmt.where(Scholarship.amount >= min_amount)
        if upcoming_only:
            stmt = stmt.where(Scholarship.deadline.is_(None) | (Scholarship.deadline >= date.today()))
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(func.lower(Scholarship.name).like(like))
        if course:
            stmt = stmt.join(ScholarshipCourse, ScholarshipCourse.scholarship_id == Scholarship.id).join(Course, Course.id == ScholarshipCourse.course_id).where(func.lower(Course.name) == course.lower())
        if state:
            stmt = stmt.join(ScholarshipState, ScholarshipState.scholarship_id == Scholarship.id).where(func.lower(ScholarshipState.state) == state.lower())
        stmt = stmt.order_by(Scholarship.deadline.asc().nulls_last(), Scholarship.name.asc())

        paginated = await paginate(session, stmt, page=page, size=size)
        reads = [await self._to_read(session, s) for s in paginated.items]
        return PaginatedData(
            items=reads,
            total=paginated.total,
            page=page,
            size=size,
            pages=paginated.pages,
        )

    async def get_facets(self, session: AsyncSession) -> ScholarshipFacets:
        states = (await session.execute(
            select(ScholarshipState.state, func.count()).where(Scholarship.deleted_at.is_(None))
            .join(Scholarship, Scholarship.id == ScholarshipState.scholarship_id)
            .group_by(ScholarshipState.state).order_by(func.count().desc())
        )).all()
        courses = (await session.execute(
            select(Course.name, func.count()).join(ScholarshipCourse, ScholarshipCourse.course_id == Course.id)
            .join(Scholarship, Scholarship.id == ScholarshipCourse.scholarship_id)
            .where(Scholarship.deleted_at.is_(None)).group_by(Course.name)
        )).all()
        total = (await session.execute(select(func.count()).select_from(Scholarship).where(Scholarship.deleted_at.is_(None)))).scalar_one()
        return ScholarshipFacets(
            total=total,
            states=[ScholarshipFacetBucket(label=s, count=c) for s, c in states],
            courses=[ScholarshipFacetBucket(label=c, count=n) for c, n in courses],
            statuses=[],
        )

    async def publish(self, session: AsyncSession, id: uuid.UUID, status_value: str) -> ScholarshipRead:
        db_obj = await self.get_or_404(session, id)
        db_obj.status = status_value
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)

    async def verify(self, session: AsyncSession, id: uuid.UUID, verification_status: Optional[str], last_verified_at) -> ScholarshipRead:
        db_obj = await self.get_or_404(session, id)
        db_obj.verification_status = verification_status
        db_obj.last_verified_at = last_verified_at
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)


scholarship_repository = BaseRepository[Scholarship, ScholarshipCreate, ScholarshipUpdate](Scholarship)
scholarship_service = ScholarshipService(scholarship_repository)