from typing import Optional
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.education import College, University, CollegeCourse, Course
from app.models.system import Location
from app.models.exams import Exam
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

    def _filter_clauses(
        self,
        *,
        search: str | None = None,
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
        exclude: frozenset[str] = frozenset(),
    ) -> list:
        """Filter predicates for a query rooted at ``College``.

        ``exclude`` skips a dimension so facet queries can broaden their scope
        (e.g. the ``states`` facet ignores all location filters).
        """
        clauses = []

        if is_published is not None and "is_published" not in exclude:
            clauses.append(College.is_published.is_(is_published))
        if state and "state" not in exclude:
            clauses.append(Location.state == state)
        if district and "district" not in exclude:
            clauses.append(Location.district == district)
        if city and "city" not in exclude:
            clauses.append(Location.city == city)
        if course and "course" not in exclude:
            clauses.append(Course.name.ilike(f"%{course}%"))
        if university and "university" not in exclude:
            clauses.append(University.name.ilike(f"%{university}%"))
        if college_type and "college_type" not in exclude:
            clauses.append(College.college_type == college_type)
        if is_private is not None and "is_private" not in exclude:
            clauses.append(College.is_private.is_(is_private))
        if min_fee is not None and "min_fee" not in exclude:
            clauses.append(CollegeCourse.fees >= min_fee)
        if max_fee is not None and "max_fee" not in exclude:
            clauses.append(CollegeCourse.fees <= max_fee)
        if has_hostel is not None and "has_hostel" not in exclude:
            clauses.append(College.has_hostel.is_(has_hostel))
        if accreditation and "accreditation" not in exclude:
            clauses.append(College.accreditation.ilike(f"%{accreditation}%"))
        if admission_status and "admission_status" not in exclude:
            clauses.append(College.admission_status == admission_status)
        if verification_status and "verification_status" not in exclude:
            clauses.append(College.verification_status == verification_status)
        if rating is not None and "rating" not in exclude:
            clauses.append(College.rating >= rating)

        return clauses

    def _needed_joins(
        self,
        *,
        course: str | None = None,
        state: str | None = None,
        district: str | None = None,
        city: str | None = None,
        university: str | None = None,
        min_fee: float | None = None,
        max_fee: float | None = None,
        exclude: frozenset[str] = frozenset(),
    ) -> frozenset[str]:
        joins: set[str] = set()
        if (state and "state" not in exclude) or (district and "district" not in exclude) or (city and "city" not in exclude):
            joins.add("location")
        if (course and "course" not in exclude) or (min_fee is not None and "min_fee" not in exclude) or (max_fee is not None and "max_fee" not in exclude):
            joins.add("college_course")
        if course and "course" not in exclude:
            joins.add("course")
        if university and "university" not in exclude:
            joins.add("university")
        return frozenset(joins)

    def _apply_joins(self, stmt, joins: frozenset[str]):
        if "location" in joins:
            stmt = stmt.join(Location, College.location_id == Location.id)
        if "college_course" in joins:
            stmt = stmt.join(CollegeCourse, CollegeCourse.college_id == College.id)
        if "course" in joins:
            stmt = stmt.join(Course, CollegeCourse.course_id == Course.id)
        if "university" in joins:
            stmt = stmt.join(University, College.university_id == University.id)
        return stmt

    def _apply_order(self, query, *, sort: str | None = None, search_tsquery=None):
        if sort == "name":
            return query.order_by(College.name.asc())
        if sort == "rating":
            return query.order_by(College.rating.desc().nullslast(), College.name.asc())
        if sort in ("fees_asc", "fees_desc"):
            min_fee_subq = (
                select(func.min(CollegeCourse.fees))
                .where(CollegeCourse.college_id == College.id)
                .correlate(College)
                .scalar_subquery()
            )
            if sort == "fees_asc":
                return query.order_by(min_fee_subq.asc().nullslast(), College.name.asc())
            return query.order_by(min_fee_subq.desc().nullslast(), College.name.asc())
        if search_tsquery is not None:
            return query.order_by(
                func.ts_rank_cd(College.search_vector, search_tsquery).desc().nullslast(),
                College.name.asc(),
            )
        return query.order_by(College.name.asc())

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
        sort: str | None = None,
    ):
        """Return a query object suitable for pagination with all filters applied.

        Search combines PostgreSQL full-text search (``search_vector``) with a
        trigram-backed ILIKE fallback so partial/substring and non-ASCII matches
        still hit.
        """
        filter_kwargs = dict(
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
        joins = self._needed_joins(
            course=course,
            state=state,
            district=district,
            city=city,
            university=university,
            min_fee=min_fee,
            max_fee=max_fee,
        )

        clauses = self._filter_clauses(**filter_kwargs)

        search_tsquery = None
        s = (search or "").strip()
        if s:
            search_tsquery = func.websearch_to_tsquery("english", s)
            # ILIKE is expressed via lower() + LIKE so the pg_trgm GIN index on
            # lower(name)/lower(official_name)/lower(college_code) can be used.
            pattern = f"%{s.lower()}%"
            clauses.append(
                or_(
                    College.search_vector.op("@@")(search_tsquery),
                    func.lower(College.name).like(pattern),
                    func.lower(College.official_name).like(pattern),
                    func.lower(College.college_code).like(pattern),
                )
            )

        # Distinct college IDs that match the filters. Deduplicating here (not on
        # the full SELECT) keeps `ORDER BY` expressions like ts_rank or the
        # min-fee subquery legal: PostgreSQL rejects ORDER BY columns that are
        # not in the select list on a `SELECT DISTINCT ...`.
        ids_subq = self._apply_joins(
            select(College.id).select_from(College), joins
        )
        if clauses:
            ids_subq = ids_subq.where(and_(*clauses))
        ids_subq = ids_subq.distinct()

        query = select(College).where(College.id.in_(ids_subq))
        query = self._apply_order(query, sort=sort, search_tsquery=search_tsquery)
        return query

    async def _facet_rows(
        self,
        session: AsyncSession,
        col_expr,
        *,
        filters: dict,
        exclude: frozenset[str] = frozenset(),
        group_joins: frozenset[str] = frozenset(),
        limit: int = 30,
    ) -> list[tuple[str, int]]:
        count_expr = func.count(func.distinct(College.id)).label("count")
        joins = self._needed_joins(
            course=filters.get("course"),
            state=filters.get("state"),
            district=filters.get("district"),
            city=filters.get("city"),
            university=filters.get("university"),
            min_fee=filters.get("min_fee"),
            max_fee=filters.get("max_fee"),
            exclude=exclude,
        )
        # The grouped column's table must always be reachable (e.g. Location
        # for the states facet even when no location filter is active).
        joins = joins | group_joins
        stmt = select(col_expr.label("label"), count_expr).select_from(College)
        stmt = self._apply_joins(stmt, joins)
        clauses = self._filter_clauses(**filters, exclude=exclude)
        if clauses:
            stmt = stmt.where(and_(*clauses))
        stmt = stmt.group_by(col_expr).order_by(count_expr.desc(), col_expr.asc()).limit(limit)
        result = await session.execute(stmt)
        return [(str(label), int(count)) for label, count in result.all() if label is not None]

    async def get_facets(
        self,
        session: AsyncSession,
        *,
        search: str | None = None,
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
        limit: int = 30,
    ) -> dict:
        filters = dict(
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

        total_stmt = select(func.count(func.distinct(College.id))).select_from(College)
        total_stmt = self._apply_joins(
            total_stmt,
            self._needed_joins(
                course=course, state=state, district=district, city=city,
                university=university, min_fee=min_fee, max_fee=max_fee,
            ),
        )
        clauses = self._filter_clauses(**filters)
        if clauses:
            total_stmt = total_stmt.where(and_(*clauses))
        total = (await session.execute(total_stmt)).scalar_one() or 0

        location_exclude = frozenset({"state", "district", "city"})
        return {
            "total": int(total),
            "states": await self._facet_rows(
                session, Location.state, filters=filters, exclude=location_exclude,
                group_joins=frozenset({"location"}), limit=limit,
            ),
            "districts": await self._facet_rows(
                session, Location.district, filters=filters,
                exclude=frozenset({"district", "city"}),
                group_joins=frozenset({"location"}), limit=limit,
            ),
            "cities": await self._facet_rows(
                session, Location.city, filters=filters,
                exclude=frozenset({"city"}),
                group_joins=frozenset({"location"}), limit=limit,
            ),
            "college_types": await self._facet_rows(
                session, College.college_type, filters=filters,
                exclude=frozenset({"college_type"}), limit=limit,
            ),
            "courses": await self._facet_rows(
                session, Course.name, filters=filters,
                exclude=frozenset({"course"}),
                group_joins=frozenset({"college_course", "course"}), limit=limit,
            ),
            "universities": await self._facet_rows(
                session, University.name, filters=filters,
                exclude=frozenset({"university"}),
                group_joins=frozenset({"university"}), limit=limit,
            ),
            "accreditation": await self._facet_rows(
                session, College.accreditation, filters=filters,
                exclude=frozenset({"accreditation"}), limit=limit,
            ),
            "admission_statuses": await self._facet_rows(
                session, College.admission_status, filters=filters,
                exclude=frozenset({"admission_status"}), limit=limit,
            ),
        }

    async def search_suggestions(self, session: AsyncSession, q: str, limit: int = 5) -> dict:
        """Return raw suggestion rows for colleges, courses, exams and locations."""
        p = q.strip()
        like = f"%{p}%"

        college_stmt = (
            select(
                College.name,
                College.slug,
                Location.city,
                Location.state,
                func.similarity(College.name, p).label("score"),
            )
            .select_from(College)
            .outerjoin(Location, College.location_id == Location.id)
            .where(func.lower(College.name).like(f"%{p.lower()}%"))
            .order_by(func.similarity(College.name, p).desc(), College.name.asc())
            .limit(limit)
        )
        college_rows = (await session.execute(college_stmt)).all()

        course_stmt = (
            select(
                Course.name,
                func.count(func.distinct(CollegeCourse.college_id)).label("n"),
            )
            .select_from(Course)
            .outerjoin(CollegeCourse, CollegeCourse.course_id == Course.id)
            .where(func.lower(Course.name).like(f"%{p.lower()}%"))
            .group_by(Course.name)
            .order_by(func.count(func.distinct(CollegeCourse.college_id)).desc(), Course.name.asc())
            .limit(limit)
        )
        course_rows = (await session.execute(course_stmt)).all()

        exam_stmt = (
            select(Exam.name, Exam.full_name)
            .where(func.lower(Exam.name).like(f"%{p.lower()}%"))
            .order_by(Exam.name.asc())
            .limit(limit)
        )
        exam_rows = (await session.execute(exam_stmt)).all()

        state_rows = (
            await session.execute(
                select(Location.state)
                .where(func.lower(Location.state).like(f"%{p.lower()}%"))
                .distinct()
                .order_by(Location.state.asc())
                .limit(limit)
            )
        ).scalars().all()

        district_rows = (
            await session.execute(
                select(Location.district)
                .where(Location.district.is_not(None), func.lower(Location.district).like(f"%{p.lower()}%"))
                .distinct()
                .order_by(Location.district.asc())
                .limit(limit)
            )
        ).scalars().all()

        city_rows = (
            await session.execute(
                select(Location.city)
                .where(func.lower(Location.city).like(f"%{p.lower()}%"))
                .distinct()
                .order_by(Location.city.asc())
                .limit(limit)
            )
        ).scalars().all()

        return {
            "colleges": [(r.name, r.slug, r.city, r.state) for r in college_rows],
            "courses": [(r.name, int(r.n)) for r in course_rows],
            "exams": [(r.name, r.full_name) for r in exam_rows],
            "states": list(state_rows),
            "districts": list(district_rows),
            "cities": list(city_rows),
        }


college_repository = CollegeRepository(College)