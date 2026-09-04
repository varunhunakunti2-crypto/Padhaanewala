import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    """Create an SEO-friendly slug from a college name."""
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


class CollegeService(BaseService[College, CollegeCreate, CollegeUpdate]):
    async def _ensure_unique_slug(self, session: AsyncSession, name: str, exclude_id: uuid.UUID | None = None) -> str:
        base_slug = slugify(name)
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

    async def create(self, session: AsyncSession, obj_in: CollegeCreate) -> College:
        existing = await self.repository.get_by_code(session, obj_in.college_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"College with code {obj_in.college_code} already exists."
            )
        await self._check_duplicate_name(session, obj_in.name)

        data = obj_in.model_dump(exclude_unset=True)
        data["slug"] = await self._ensure_unique_slug(session, obj_in.name)
        if obj_in.verification_status is None:
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
        return await self.repository.update(session, db_obj=db_obj, obj_in=data)

    async def get_by_slug_or_404(self, session: AsyncSession, slug: str) -> College:
        college = await college_repository.get_by_slug(session, slug)
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
        return college

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

    async def publish(self, session: AsyncSession, id: uuid.UUID, obj_in: CollegePublishUpdate) -> College:
        db_obj = await self.get_or_404(session, id)
        db_obj.is_published = obj_in.is_published
        session.add(db_obj)
        await session.commit()
        await session.refresh(db_obj)
        return db_obj

    async def verify(self, session: AsyncSession, id: uuid.UUID, obj_in: CollegeVerifyUpdate, verified_by: uuid.UUID | None = None) -> College:
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
        return db_obj

    async def bulk_archive(self, session: AsyncSession, ids: list[uuid.UUID]) -> int:
        count = 0
        for cid in ids:
            obj = await self.get_or_404(session, cid)
            await self.repository.remove(session, id=cid)
            count += 1
        return count

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
            is_published=is_published,
        )
        return await paginate(session, query, page, size)


college_service = CollegeService(college_repository)