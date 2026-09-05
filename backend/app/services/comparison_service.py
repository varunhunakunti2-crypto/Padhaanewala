"""Comparison service.

Provides:
- ``compare``: normalized side-by-side data for up to 4 colleges -- only
  stored/verified fields are ever returned (no invented data).
- ``ai_compare``: a deterministic, rules-based "which college is better for
  me?" analysis over the same verified fields. It never claims guaranteed
  admission; the output contract is designed to be swappable to an LLM
  (Phase 26) without changing the frontend.
"""

from typing import List, Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.education import (
    Admission,
    College,
    CollegeCourse,
    CollegeFacility,
    Course,
    Cutoff,
    Facility,
    University,
)
from app.models.exams import Exam
from app.models.reviews import Review
from app.models.system import Location
from app.schemas.comparison import (
    AICompareRequest,
    AICompareResponse,
    AICollegeAnalysis,
    ComparisonCollege,
    ComparisonCourse,
    ComparisonCutoff,
    ComparisonPreferences,
    ComparisonRequest,
    ComparisonResponse,
    ComparisonReview,
)


def _fmt_verified_sources(c: ComparisonCollege) -> str | None:
    if c.last_verified_at:
        return c.last_verified_at.strftime("%d %b %Y")
    return None


async def _load_college(
    session: AsyncSession, college: College
) -> ComparisonCollege:
    """Build a normalized ComparisonCollege from a College row (stored fields only)."""
    c = ComparisonCollege(
        id=college.id,
        name=college.name,
        slug=college.slug,
        official_name=college.official_name,
        college_type=college.college_type,
        is_private=bool(college.is_private),
        accreditation=college.accreditation,
        recognition=college.recognition,
        established_year=college.established_year,
        website=college.website,
        email=college.email,
        phone=college.phone,
        address=college.address,
        pincode=college.pincode,
        entrance_exam=college.entrance_exam,
        admission_status=college.admission_status,
        has_hostel=bool(college.has_hostel),
        rating=college.rating,
        verification_status=college.verification_status,
        source_name=college.source_name,
        last_verified_at=college.last_verified_at,
    )

    if college.university_id:
        uni = await session.get(University, college.university_id)
        c.university_name = uni.name if uni else None

    if college.location_id:
        loc = await session.get(Location, college.location_id)
        if loc:
            c.state = loc.state
            c.district = loc.district
            c.city = loc.city
            c.pincode = loc.pincode or college.pincode

    # Courses + fees + duration + intake (stored in college_courses)
    cc_result = await session.execute(
        select(CollegeCourse, Course)
        .join(Course, CollegeCourse.course_id == Course.id)
        .where(CollegeCourse.college_id == college.id)
        .order_by(Course.name)
    )
    c.courses = [
        ComparisonCourse(
            course_id=course.id,
            name=course.name,
            level=course.level,
            duration_months=cc.duration_months,
            fees=cc.fees,
            intake=cc.intake,
        )
        for cc, course in cc_result.all()
    ]

    # Facilities
    fac_result = await session.execute(
        select(Facility)
        .join(CollegeFacility, CollegeFacility.facility_id == Facility.id)
        .where(CollegeFacility.college_id == college.id)
    )
    c.facilities = [f.name for f in fac_result.scalars().all()]

    # Cutoffs (latest first)
    cutoff_result = await session.execute(
        select(Cutoff, Course, Exam)
        .join(Course, Cutoff.course_id == Course.id)
        .outerjoin(Exam, Cutoff.exam_id == Exam.id)
        .where(Cutoff.college_id == college.id)
        .order_by(Cutoff.year.desc())
    )
    c.cutoffs = [
        ComparisonCutoff(
            course_name=course.name,
            exam_name=exam.name if exam else None,
            year=co.year,
            category=co.category,
            opening_rank=co.opening_rank,
            closing_rank=co.closing_rank,
        )
        for co, course, exam in cutoff_result.all()
    ]

    # Approved reviews only
    rev_result = await session.execute(
        select(Review)
        .where(Review.college_id == college.id, Review.status == "approved")
        .order_by(Review.created_at.desc())
    )
    c.reviews = [
        ComparisonReview(
            id=r.id, rating=r.rating, title=r.title, content=r.content, created_at=r.created_at
        )
        for r in rev_result.scalars().all()
    ]

    # Admission / eligibility
    adm_result = await session.execute(
        select(Admission)
        .where(Admission.college_id == college.id)
        .order_by(Admission.created_at.desc())
    )
    adm = adm_result.scalars().first()
    if adm:
        c.eligibility = adm.eligibility_criteria
        c.admission_process = adm.process_details

    return c


async def _fetch_public_colleges(
    session: AsyncSession, ids: Sequence, expected_ids: set
) -> List[College]:
    result = await session.execute(
        select(College).where(College.id.in_(ids), College.is_published.is_(True))
    )
    colleges = list(result.scalars().all())
    found = {c.id for c in colleges}
    missing = expected_ids - found
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No published college found for ids: {', '.join(str(m) for m in missing)}",
        )
    return colleges


class ComparisonService:
    async def compare(
        self, session: AsyncSession, request: ComparisonRequest
    ) -> ComparisonResponse:
        ids = list(dict.fromkeys(request.college_ids))  # dedupe, preserve order
        colleges = await _fetch_public_colleges(session, ids, set(ids))

        built: List[ComparisonCollege] = []
        for college in colleges:
            built.append(await _load_college(session, college))

        built.sort(key=lambda c: ids.index(c.id))
        return ComparisonResponse(colleges=built, course_id=request.course_id)

    async def ai_compare(
        self, session: AsyncSession, request: AICompareRequest
    ) -> AICompareResponse:
        ids = list(dict.fromkeys(request.college_ids))
        colleges = await _fetch_public_colleges(session, ids, set(ids))
        built: List[ComparisonCollege] = []
        for college in colleges:
            built.append(await _load_college(session, college))
        built.sort(key=lambda c: ids.index(c.id))

        prefs = request.preferences or ComparisonPreferences()

        analyses: List[AICollegeAnalysis] = []
        for c in built:
            analyses.append(_analyze(c, prefs))

        # Best-scoring college for the overall summary (informational only).
        best = max(analyses, key=lambda a: a.score)
        footer = (
            f"Only verified database fields were used. This is an estimate to help "
            f"you shortlist - it is NOT an admission guarantee."
        )
        if prefs.course:
            mention = f" for {prefs.course}"
        else:
            mention = ""
        overall = (
            f"Based on Padhaanewala's verified database, {best.name} scores highest "
            f"({best.score}/100){mention}. Compare eligibility, fees and cutoffs with the "
            f"institution before applying. {footer}"
        )

        return AICompareResponse(colleges=analyses, overall_summary=overall)


def _analyze(c: ComparisonCollege, prefs: ComparisonPreferences) -> AICollegeAnalysis:
    score = 0
    strengths: List[str] = []
    weaknesses: List[str] = []
    sources: List[str] = []

    min_fee = min((co.fees for co in c.courses if co.fees is not None), default=None)

    # ---- Course match ----
    if prefs.course:
        wanted = prefs.course.strip().lower()
        matched = next((co for co in c.courses if wanted in co.name.lower()), None)
        if matched:
            score += 25
            strengths.append(f"Offers {matched.name} (verified database)")
            sources.append(f"course={matched.name}")
        else:
            weaknesses.append(
                f"{prefs.course} not found among published courses (verified database)"
            )
            sources.append("courses in database")

    # ---- Budget ----
    if prefs.budget is not None:
        if min_fee is None:
            weaknesses.append("Fees not available in verified database")
            sources.append("fees not available")
        elif min_fee <= prefs.budget:
            score += 15
            strengths.append(f"Fees from ₹{min_fee:,.0f}/year - within your ₹{prefs.budget:,.0f} budget")
            sources.append(f"min_fee={min_fee:,.0f}")
        else:
            weaknesses.append(
                f"Fees from ₹{min_fee:,.0f}/year - above your ₹{prefs.budget:,.0f} budget"
            )
            sources.append(f"min_fee={min_fee:,.0f}")

    # ---- Hostel ----
    if prefs.requires_hostel:
        if c.has_hostel:
            score += 10
            strengths.append("Hostel available (verified database)")
            sources.append("has_hostel=true")
        else:
            weaknesses.append("Hostel not listed as available")
            sources.append("has_hostel=false")

    # ---- Ownership ----
    if prefs.prefers_govt:
        if not c.is_private:
            score += 10
            strengths.append("Government college (verified database)")
        else:
            weaknesses.append("Private college (you preferred government)")
        sources.append(f"is_private={c.is_private}")

    # ---- Location ----
    if prefs.state and prefs.state.strip().lower() == (c.state or "").lower():
        score += 10
        strengths.append(f"Located in {c.state} (your preferred state)")
        sources.append(f"state={c.state}")
    if prefs.city and prefs.city.strip().lower() == (c.city or "").lower():
        score += 5
        strengths.append(f"Located in {c.city}")
        sources.append(f"city={c.city}")

    # ---- Data completeness + quality (verified fields only) ----
    if c.rating is not None:
        pts = round(min(c.rating, 5.0) / 5.0 * 10)
        score += pts
        if c.rating >= 4.0:
            strengths.append(f"Rated {c.rating:.1f}/5 from {len(c.reviews)} approved reviews")
            sources.append(f"rating={c.rating:.1f}, reviews={len(c.reviews)}")
        else:
            strengths.append(f"Rating {c.rating:.1f}/5 ({len(c.reviews)} approved reviews)")
            sources.append(f"rating={c.rating:.1f}")
    else:
        weaknesses.append("No approved reviews yet in verified database")
        sources.append("reviews not available")

    if c.accreditation:
        score += 5
        strengths.append(f"Accreditation: {c.accreditation}")
        sources.append(f"accreditation={c.accreditation}")
    else:
        weaknesses.append("Accreditation not available in verified database")
        sources.append("accreditation not available")

    if c.cutoffs:
        score += 5
        latest = c.cutoffs[0]
        strengths.append(
            f"Cutoff data available ({latest.course_name} closing rank {latest.closing_rank or 'n/a'} in {latest.year}, {latest.category or 'General'})"
        )
        sources.append(f"cutoff={latest.year} closing_rank={latest.closing_rank or 'n/a'}")
    else:
        weaknesses.append("Cutoff data not available in verified database")

    if c.eligibility:
        score += 3
        sources.append("eligibility in database")
    else:
        weaknesses.append("Eligibility details not available in verified database")

    if c.admission_process:
        score += 2
        sources.append("admission process in database")

    status_map = {"open": 5, "tentative": 2, "closed": 0}
    if c.admission_status and c.admission_status.lower() in status_map:
        score += status_map[c.admission_status.lower()]
        if status_map[c.admission_status.lower()] > 0:
            strengths.append(f"Admissions currently {c.admission_status}")
            sources.append(f"admission_status={c.admission_status}")

    score = min(score, 100)

    if score >= 70:
        tier = "HIGHLY_SUITABLE"
    elif score >= 50:
        tier = "POSSIBLE"
    else:
        tier = "REACH"

    top = strengths[0] if strengths else "Few verified datapoints available"
    summary = (
        f"{c.name} scores {score}/100 ({tier.replace('_', ' ').title()}) for your "
        f"criteria. {top}. Always verify with the institution before applying."
    )

    verified = _fmt_verified_sources(c)
    if verified:
        sources.append(f"verified={verified}")

    return AICollegeAnalysis(
        college_id=c.id,
        name=c.name,
        slug=c.slug,
        tier=tier,
        score=score,
        summary=summary,
        strengths=strengths,
        weaknesses=weaknesses,
        sources=sources,
    )


comparison_service = ComparisonService()