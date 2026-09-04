import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.base import BaseService
from app.models.education import (
    College,
    University,
    CollegeCourse,
    Course,
    Facility,
    CollegeFacility,
    Admission,
    Cutoff,
)
from app.models.exams import Exam
from app.models.system import Location, Media
from app.models.reviews import Review
from app.models.content import FAQ
from app.schemas.college import (
    CollegeCreate,
    CollegeUpdate,
    CollegeRead,
    CollegePublishUpdate,
    CollegeVerifyUpdate,
    CollegeDetail,
    CollegeCourseDetail,
    CollegeFacilityDetail,
    CollegeReviewDetail,
    CollegeFaqDetail,
    CollegeCutoffDetail,
    CollegeMediaDetail,
)
from app.repositories.college_repository import college_repository
from app.utils.pagination import paginate
from app.schemas.common import PaginatedData


def slugify(name: str) -> str:
    """Create an SEO-friendly slug from a college name.

    Non-ASCII only names (e.g. Devanagari) produce an empty slug; callers
    fall back to a uuid-derived slug so uniqueness is always preserved.
    """
    s = name.lower().strip()
    s = re.sub(r"&", "and", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s


def normalize_name(name: str) -> str:
    """Normalize for duplicate detection: lowercase, strip common words."""
    s = re.sub(r"[^a-z0-9\s]", "", name.lower().strip())
    words = ["the", "college", "institute", "institutes", "school", "schools", "university"]
    for w in words:
        s = s.replace(f" {w} ", " ")
        if s == w:
            s = ""
    return " ".join(s.split())


_LOCATION_FIELDS = ("state", "district", "city")


class CollegeService(BaseService[College, CollegeCreate, CollegeUpdate]):
    async def _ensure_unique_slug(self, session: AsyncSession, name: str, exclude_id: uuid.UUID | None = None) -> str:
        base_slug = slugify(name)
        if not base_slug:
            base_slug = f"college-{uuid.uuid4().hex[:8]}"
        slug = base_slug
        counter = 1
        while True:
            result = await session.execute(
                select(College).where(College.slug == slug)
                if exclude_id is None
                else select(College).where(College.slug == slug, College.id != exclude_id)
            )
            if result.scalars().first() is None:
                return slug
            counter += 1
            slug = f"{base_slug}-{counter}"

    async def _check_duplicate_name(self, session: AsyncSession, name: str, exclude_id: uuid.UUID | None = None) -> None:
        result = await session.execute(
            select(College) if exclude_id is None else select(College).where(College.id != exclude_id)
        )
        for c in result.scalars().all():
            if normalize_name(c.name) and normalize_name(name) and normalize_name(c.name) == normalize_name(name):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A college with a similar name already exists: {c.name}",
                )

    async def _resolve_location_id(self, session: AsyncSession, fields: dict) -> uuid.UUID:
        """Find or create a Location row from state/district/city fields."""
        clean = {k: (v or None) for k, v in fields.items()}
        if not clean.get("state") and not clean.get("district") and not clean.get("city"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="At least one of state, district or city is required to set a location.",
            )
        query = select(Location)
        for key in _LOCATION_FIELDS:
            val = clean.get(key)
            query = query.where(
                Location.__table__.c[key].is_(None) if val is None else Location.__table__.c[key] == val
            )
        result = await session.execute(query)
        existing = result.scalars().first()
        if existing:
            return existing.id
        location = Location(**clean)
        session.add(location)
        await session.flush()
        return location.id

    async def _resolve_university_id(self, session: AsyncSession, name: str) -> uuid.UUID:
        """Find or create a University by name (case-insensitive)."""
        normalized = name.strip()
        if not normalized:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="University name cannot be empty.",
            )
        result = await session.execute(
            select(University).where(func.lower(University.name) == normalized.lower())
        )
        university = result.scalars().first()
        if university:
            return university.id
        university = University(name=normalized)
        session.add(university)
        await session.flush()
        return university.id

    async def _to_read(self, session: AsyncSession, college: College) -> CollegeRead:
        """Build a CollegeRead enriched with location + university names."""
        read = CollegeRead.model_validate(college)
        if college.location_id:
            loc = await session.get(Location, college.location_id)
            if loc:
                read.state = loc.state
                read.district = loc.district
                read.city = loc.city
                read.location = {
                    "state": loc.state,
                    "district": loc.district,
                    "city": loc.city,
                    "pincode": loc.pincode or college.pincode,
                }
        if college.university_id:
            uni = await session.get(University, college.university_id)
            if uni:
                read.university_name = uni.name
        if college.verified_by_id:
            read.verified_by = str(college.verified_by_id)
        return read

    async def create(self, session: AsyncSession, obj_in: CollegeCreate) -> College:
        existing = await self.repository.get_by_code(session, obj_in.college_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"College with code {obj_in.college_code} already exists."
            )
        await self._check_duplicate_name(session, obj_in.name)

        data = obj_in.model_dump(exclude_unset=True)

        location_fields = {f: data.pop(f) for f in _LOCATION_FIELDS if data.get(f)}
        if location_fields:
            data["location_id"] = await self._resolve_location_id(session, location_fields)

        university_name = data.pop("university_name", None)
        if university_name:
            data["university_id"] = await self._resolve_university_id(session, university_name)

        data["slug"] = await self._ensure_unique_slug(session, obj_in.name)
        if data.get("verification_status") is None:
            data["verification_status"] = "unverified"

        obj = College(**data)
        session.add(obj)
        await session.commit()
        await session.refresh(obj)
        return obj

    async def update(self, session: AsyncSession, id: uuid.UUID, obj_in: CollegeUpdate) -> College:
        db_obj = await self.get_or_404(session, id)
        data = obj_in.model_dump(exclude_unset=True)

        if "name" in data and data["name"] != db_obj.name:
            await self._check_duplicate_name(session, data["name"], exclude_id=id)
        if "name" in data and ("slug" not in data or not data["slug"]):
            data["slug"] = await self._ensure_unique_slug(session, data["name"], exclude_id=id)
        if "slug" in data and data["slug"]:
            data["slug"] = await self._ensure_unique_slug(session, data["slug"], exclude_id=id)

        provided_location = {f: data.pop(f) for f in _LOCATION_FIELDS if data.get(f)}
        if provided_location:
            loc = None
            if db_obj.location_id:
                loc = await session.get(Location, db_obj.location_id)
            if loc is None:
                loc = Location(**provided_location)
                session.add(loc)
                await session.flush()
            else:
                for key, value in provided_location.items():
                    setattr(loc, key, value)
                session.add(loc)
            data["location_id"] = loc.id

        if "university_name" in data:
            university_name = data.pop("university_name", None)
            if university_name:
                data["university_id"] = await self._resolve_university_id(session, university_name)
            else:
                data.pop("university_id", None)
                data["university_id"] = None

        return await self.repository.update(session, db_obj=db_obj, obj_in=data)

    async def get_by_slug_or_404(self, session: AsyncSession, slug: str) -> College:
        college = await college_repository.get_by_slug(session, slug)
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
        return college

    async def get_read(self, session: AsyncSession, id: uuid.UUID) -> CollegeRead:
        college = await self.get_or_404(session, id)
        return await self._to_read(session, college)

    async def get_read_by_slug(self, session: AsyncSession, slug: str) -> CollegeRead:
        college = await self.get_by_slug_or_404(session, slug)
        return await self._to_read(session, college)

    async def get_detail(self, session: AsyncSession, slug: str) -> CollegeDetail:
        """Assemble the full public college detail including courses, fees,
        facilities, reviews, FAQs, cutoffs, gallery and verification info."""
        college = await self.get_by_slug_or_404(session, slug)
        if not college.is_published and not college.verification_status == "verified":
            raise HTTPException(status_code=404, detail="College not found")

        detail = CollegeDetail.model_validate(college)

        if college.university_id:
            uni = await session.get(University, college.university_id)
            detail.university_name = uni.name if uni else None

        if college.location_id:
            loc = await session.get(Location, college.location_id)
            if loc:
                detail.location = {
                    "state": loc.state,
                    "district": loc.district,
                    "city": loc.city,
                    "pincode": loc.pincode or college.pincode,
                }
                detail.state = loc.state
                detail.district = loc.district
                detail.city = loc.city

        # Courses + fees
        cc_result = await session.execute(
            select(CollegeCourse, Course)
            .join(Course, CollegeCourse.course_id == Course.id)
            .where(CollegeCourse.college_id == college.id)
        )
        detail.courses = [
            CollegeCourseDetail(
                course_id=course.id,
                course_name=course.name,
                level=course.level,
                fees=cc.fees,
                duration_months=cc.duration_months,
                intake=cc.intake,
            )
            for cc, course in cc_result.all()
        ]

        # Facilities
        fid_result = await session.execute(
            select(Facility)
            .join(CollegeFacility, CollegeFacility.facility_id == Facility.id)
            .where(CollegeFacility.college_id == college.id)
        )
        detail.facilities = [CollegeFacilityDetail(name=f.name) for f in fid_result.scalars().all()]

        # Approved reviews
        rev_result = await session.execute(
            select(Review)
            .where(Review.college_id == college.id, Review.status == "approved")
            .order_by(Review.created_at.desc())
        )
        detail.reviews = [
            CollegeReviewDetail(
                id=r.id, rating=r.rating, title=r.title, content=r.content, created_at=r.created_at
            )
            for r in rev_result.scalars().all()
        ]

        # FAQs
        faq_result = await session.execute(
            select(FAQ).where(FAQ.entity_type == "college", FAQ.entity_id == college.id)
        )
        detail.faqs = [
            CollegeFaqDetail(question=f.question, answer=f.answer) for f in faq_result.scalars().all()
        ]

        # Cutoffs
        cutoff_result = await session.execute(
            select(Cutoff, Course, Exam)
            .join(Course, Cutoff.course_id == Course.id)
            .outerjoin(Exam, Cutoff.exam_id == Exam.id)
            .where(Cutoff.college_id == college.id)
            .order_by(Cutoff.year.desc())
        )
        detail.cutoffs = [
            CollegeCutoffDetail(
                course_name=course.name,
                exam_name=exam.name if exam else None,
                year=co.year,
                category=co.category,
                opening_rank=co.opening_rank,
                closing_rank=co.closing_rank,
            )
            for co, course, exam in cutoff_result.all()
        ]

        # Gallery / media
        media_result = await session.execute(
            select(Media).where(Media.reference_type == "college", Media.reference_id == college.id)
        )
        detail.gallery = [
            CollegeMediaDetail(url=m.url, alt_text=m.alt_text, image_type=m.reference_type)
            for m in media_result.scalars().all()
        ]

        # Admission info / eligibility
        adm_result = await session.execute(
            select(Admission).where(Admission.college_id == college.id).order_by(Admission.created_at.desc())
        )
        adms = adm_result.scalars().first()
        if adms:
            detail.eligibility = adms.eligibility_criteria
            detail.admission_process = adms.process_details

        return detail

    async def publish(self, session: AsyncSession, id: uuid.UUID, obj_in: CollegePublishUpdate) -> CollegeRead:
        db_obj = await self.get_or_404(session, id)
        db_obj.is_published = obj_in.is_published
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)

    async def verify(self, session: AsyncSession, id: uuid.UUID, obj_in: CollegeVerifyUpdate, verified_by: uuid.UUID | None = None) -> CollegeRead:
        db_obj = await self.get_or_404(session, id)
        if obj_in.verification_status is not None:
            db_obj.verification_status = obj_in.verification_status
        if obj_in.last_verified_at is not None:
            db_obj.last_verified_at = obj_in.last_verified_at
        if verified_by is not None:
            db_obj.verified_by_id = verified_by
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return await self._to_read(session, db_obj)

    async def bulk_archive(self, session: AsyncSession, ids: list[uuid.UUID]) -> int:
        result = await session.execute(
            update(College)
            .where(College.id.in_(ids), College.deleted_at.is_(None))
            .values(deleted_at=datetime.now(timezone.utc))
        )
        await session.commit()
        return result.rowcount or 0

    async def bulk_publish(self, session: AsyncSession, ids: list[uuid.UUID], is_published: bool) -> int:
        result = await session.execute(
            update(College)
            .where(College.id.in_(ids), College.deleted_at.is_(None))
            .values(is_published=is_published)
        )
        await session.commit()
        return result.rowcount or 0

    async def bulk_verify(
        self,
        session: AsyncSession,
        ids: list[uuid.UUID],
        verification_status: str | None = None,
        last_verified_at: datetime | None = None,
        verified_by: uuid.UUID | None = None,
    ) -> int:
        values: dict = {}
        if verification_status is not None:
            values["verification_status"] = verification_status
        if last_verified_at is not None:
            values["last_verified_at"] = last_verified_at
        if verified_by is not None:
            values["verified_by_id"] = verified_by
        if not values:
            return 0
        result = await session.execute(
            update(College)
            .where(College.id.in_(ids), College.deleted_at.is_(None))
            .values(**values)
        )
        await session.commit()
        return result.rowcount or 0

    async def get_paginated(
        self,
        session: AsyncSession,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        *,
        course: str | None = None,
        state: str | None = None,
        district: str | None = None,
        city: str | None = None,
        college_type: str | None = None,
        is_private: bool | None = None,
        university: str | None = None,
        min_fee: float | None = None,
        max_fee: float | None = None,
        has_hostel: bool | None = None,
        rating: float | None = None,
        accreditation: str | None = None,
        admission_status: str | None = None,
        verification_status: str | None = None,
        is_published: bool | None = None,
    ) -> PaginatedData[CollegeRead]:
        query = college_repository.get_query(
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
            verification_status=verification_status,
            is_published=is_published,
        )
        data = await paginate(session, query, page, size)
        items = [await self._to_read(session, c) for c in data.items]
        return PaginatedData(
            items=items,
            total=data.total,
            page=data.page,
            size=data.size,
            pages=data.pages,
        )


college_service = CollegeService(college_repository)