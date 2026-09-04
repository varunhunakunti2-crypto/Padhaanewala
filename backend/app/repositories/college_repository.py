from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.education import College, University, CollegeCourse, Course
from app.models.system import Location
from app.schemas.college import CollegeCreate, CollegeUpdate
from app.repositories.base import BaseRepository

class CollegeRepository(BaseRepository[College, CollegeCreate, CollegeUpdate]):
    async def get_by_code(self, session: AsyncSession, college_code: str) -> College | None:
        query = select(College).where(College.college_code == college_code)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, session: AsyncSession, slug: str) -> College | None:
        query = select(College).where(College.slug == slug)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_by_name(self, session: AsyncSession, name: str) -> College | None:
        query = select(College).where(College.name == name)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    def get_query(
        self,
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
    ):
        """Return a query object suitable for pagination with all filters applied."""
        query = select(College)

        if is_published is not None:
            query = query.where(College.is_published.is_(is_published))

        if search:
            like = f"%{search.strip()}%"
            query = query.where(
                or_(
                    College.name.ilike(like),
                    College.official_name.ilike(like),
                    College.college_code.ilike(like),
                )
            )

        if state or district or city:
            query = query.join(Location, College.location_id == Location.id)
            if state:
                query = query.where(Location.state == state)
            if district:
                query = query.where(Location.district == district)
            if city:
                query = query.where(Location.city == city)

        if course:
            query = (
                query.join(CollegeCourse, CollegeCourse.college_id == College.id)
                .join(Course, CollegeCourse.course_id == Course.id)
                .where(Course.name.ilike(f"%{course}%"))
            )

        if university:
            query = (
                query.join(University, College.university_id == University.id)
                .where(University.name.ilike(f"%{university}%"))
            )

        if college_type:
            query = query.where(College.college_type == college_type)

        if is_private is not None:
            query = query.where(College.is_private.is_(is_private))

        if min_fee is not None:
            query = query.join(CollegeCourse, CollegeCourse.college_id == College.id).where(
                CollegeCourse.fees >= min_fee
            )
        if max_fee is not None:
            query = (
                query.join(CollegeCourse, CollegeCourse.college_id == College.id)
                if min_fee is None
                else query
            ).where(CollegeCourse.fees <= max_fee)

        if has_hostel is not None:
            query = query.where(College.has_hostel.is_(has_hostel))

        if accreditation:
            query = query.where(College.accreditation.ilike(f"%{accreditation}%"))

        if admission_status:
            query = query.where(College.admission_status == admission_status)

        if verification_status:
            query = query.where(College.verification_status == verification_status)

        if rating is not None:
            query = query.where(College.rating >= rating)

        return query.distinct()

college_repository = CollegeRepository(College)