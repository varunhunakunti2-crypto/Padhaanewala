from typing import Dict, List, Any

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import HomepageContent, Post
from app.models.education import Course, College, CollegeCourse
from app.models.system import Location
from app.models.scholarships import Scholarship
from app.models.exams import Exam, ExamDate
from app.models.mock_tests import Test
from app.models.reviews import Review
from app.schemas.homepage import (
    HomepageResponse,
    HeroContent,
    QuickActionItem,
    PopularCourseItem,
    FeaturedCollegeItem,
    PopularSearchItem,
    WhyUsItem,
    CTAContent,
    ScholarshipSummary,
    UpcomingExamItem,
    MockTestItem,
    ReviewItem,
    ArticleItem,
    HomepageSectionCreate,
    HomepageSectionUpdate,
    HomepageSectionRead,
)


class HomepageService:
    # ---- CMS section CRUD (admin, Phase 19) ----

    @staticmethod
    async def list_sections(db: AsyncSession) -> List[HomepageSectionRead]:
        result = await db.execute(select(HomepageContent).order_by(HomepageContent.order))
        return [HomepageSectionRead.model_validate(s) for s in result.scalars().all()]

    @staticmethod
    async def get_section(db: AsyncSession, section: str) -> HomepageSectionRead:
        result = await db.execute(
            select(HomepageContent).where(HomepageContent.section == section)
        )
        record = result.scalars().first()
        if not record:
            raise HTTPException(status_code=404, detail="Homepage section not found")
        return HomepageSectionRead.model_validate(record)

    @staticmethod
    async def upsert_section(
        db: AsyncSession,
        section: str,
        obj_in: HomepageSectionCreate | HomepageSectionUpdate,
    ) -> HomepageSectionRead:
        result = await db.execute(
            select(HomepageContent).where(HomepageContent.section == section)
        )
        record = result.scalars().first()
        data = (
            obj_in.model_dump(exclude_unset=True)
            if isinstance(obj_in, HomepageSectionUpdate)
            else obj_in.model_dump()
        )
        if record:
            for field, value in data.items():
                setattr(record, field, value)
            record.section = section
        else:
            record = HomepageContent(section=section, **data)
            db.add(record)
        await db.commit()
        await db.refresh(record)
        return HomepageSectionRead.model_validate(record)

    @staticmethod
    async def delete_section(db: AsyncSession, section: str) -> None:
        result = await db.execute(
            select(HomepageContent).where(HomepageContent.section == section)
        )
        record = result.scalars().first()
        if not record:
            raise HTTPException(status_code=404, detail="Homepage section not found")
        await db.delete(record)
        await db.commit()

    # ---- Assembled public homepage ----

    @staticmethod
    async def _section_content(db: AsyncSession, section: str) -> Dict[str, Any]:
        result = await db.execute(
            select(HomepageContent).where(
                HomepageContent.section == section,
                HomepageContent.is_active.is_(True),
            )
        )
        record = result.scalars().first()
        return (record.content or {}) if record else {}

    @staticmethod
    async def assemble(db: AsyncSession) -> HomepageResponse:
        hero = await HomepageService._section_content(db, "hero")
        quick = await HomepageService._section_content(db, "quick_actions")
        why = await HomepageService._section_content(db, "why_us")
        cta = await HomepageService._section_content(db, "cta")
        popular_searches = await HomepageService._section_content(db, "popular_searches")
        curated_courses = await HomepageService._section_content(db, "popular_courses")
        curated_colleges = await HomepageService._section_content(db, "featured_colleges")

        return HomepageResponse(
            hero=HeroContent(**hero),
            cta=CTAContent(**cta),
            quick_actions=[QuickActionItem(**item) for item in quick.get("items", [])],
            why_us=[WhyUsItem(**item) for item in why.get("items", [])],
            popular_searches=[
                PopularSearchItem(**item) for item in popular_searches.get("items", [])
            ],
            popular_courses=await HomepageService._hydrate_courses(db, curated_courses),
            featured_colleges=await HomepageService._hydrate_colleges(db, curated_colleges),
            scholarships=await HomepageService._query_scholarships(db),
            upcoming_exams=await HomepageService._query_upcoming_exams(db),
            mock_tests=await HomepageService._query_mock_tests(db),
            reviews=await HomepageService._query_reviews(db),
            articles=await HomepageService._query_articles(db),
        )

    @staticmethod
    async def _hydrate_courses(
        db: AsyncSession, curated: Dict[str, Any]
    ) -> List[PopularCourseItem]:
        items: List[PopularCourseItem] = []
        for entry in curated.get("items", []):
            course_id = entry.get("course_id")
            if not course_id:
                continue
            result = await db.execute(select(Course).where(Course.id == course_id))
            course = result.scalars().first()
            if not course:
                continue
            count_result = await db.execute(
                select(func.count())
                .select_from(CollegeCourse)
                .where(CollegeCourse.course_id == course_id)
            )
            count = count_result.scalar() or 0
            items.append(
                PopularCourseItem(
                    id=course.id,
                    name=course.name,
                    level=course.level,
                    colleges_count=count,
                )
            )
        return items

    @staticmethod
    async def _hydrate_colleges(
        db: AsyncSession, curated: Dict[str, Any]
    ) -> List[FeaturedCollegeItem]:
        items: List[FeaturedCollegeItem] = []
        for entry in curated.get("items", []):
            college_id = entry.get("college_id")
            if not college_id:
                continue
            result = await db.execute(
                select(College, Location)
                .outerjoin(Location, College.location_id == Location.id)
                .where(College.id == college_id)
            )
            row = result.first()
            if not row:
                continue
            college, location = row
            items.append(
                FeaturedCollegeItem(
                    id=college.id,
                    name=college.name,
                    college_code=college.college_code,
                    state=location.state if location else None,
                    city=location.city if location else None,
                )
            )
        return items

    @staticmethod
    async def _query_scholarships(
        db: AsyncSession, limit: int = 4
    ) -> List[ScholarshipSummary]:
        result = await db.execute(
            select(Scholarship)
            .where(Scholarship.deleted_at.is_(None))
            .order_by(Scholarship.created_at.desc())
            .limit(limit)
        )
        return [
            ScholarshipSummary(
                id=s.id,
                name=s.name,
                provider_name=s.provider_name,
                amount=s.amount,
            )
            for s in result.scalars().all()
        ]

    @staticmethod
    async def _query_upcoming_exams(
        db: AsyncSession, limit: int = 6
    ) -> List[UpcomingExamItem]:
        result = await db.execute(
            select(ExamDate, Exam)
            .join(Exam, Exam.id == ExamDate.exam_id)
            .where(Exam.deleted_at.is_(None), ExamDate.event_date.isnot(None))
            .order_by(ExamDate.event_date.asc())
            .limit(limit)
        )
        return [
            UpcomingExamItem(
                id=exam.id,
                name=exam.name,
                event_name=edate.event_name,
                event_date=edate.event_date,
            )
            for edate, exam in result.all()
        ]

    @staticmethod
    async def _query_mock_tests(
        db: AsyncSession, limit: int = 4
    ) -> List[MockTestItem]:
        result = await db.execute(
            select(Test)
            .where(Test.deleted_at.is_(None))
            .order_by(Test.created_at.desc())
            .limit(limit)
        )
        return [
            MockTestItem(
                id=t.id,
                title=t.title,
                description=t.description,
                duration_minutes=t.duration_minutes,
            )
            for t in result.scalars().all()
        ]

    @staticmethod
    async def _query_reviews(db: AsyncSession, limit: int = 4) -> List[ReviewItem]:
        result = await db.execute(
            select(Review, College)
            .join(College, College.id == Review.college_id)
            .where(
                Review.status == "approved",
                Review.deleted_at.is_(None),
                College.deleted_at.is_(None),
            )
            .order_by(Review.created_at.desc())
            .limit(limit)
        )
        return [
            ReviewItem(
                id=r.id,
                college_name=college.name,
                rating=r.rating,
                title=r.title,
                content=r.content,
            )
            for r, college in result.all()
        ]

    @staticmethod
    async def _query_articles(db: AsyncSession, limit: int = 4) -> List[ArticleItem]:
        result = await db.execute(
            select(Post)
            .where(Post.is_published.is_(True), Post.deleted_at.is_(None))
            .order_by(Post.created_at.desc())
            .limit(limit)
        )
        return [
            ArticleItem(id=p.id, title=p.title, slug=p.slug, excerpt=p.excerpt)
            for p in result.scalars().all()
        ]


homepage_service = HomepageService()