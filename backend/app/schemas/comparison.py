from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, UUID4


COMPARISON_DISCLAIMER = (
    "Comparison data comes from the Padhaanewala verified database only. "
    "Fees, cutoffs and admission status change by year - verify current details "
    "with each institution before deciding."
)


class ComparisonRequest(BaseModel):
    college_ids: List[UUID4] = Field(..., min_length=1, max_length=4)
    course_id: Optional[UUID4] = Field(None, description="Optional focus course")


class ComparisonCourse(BaseModel):
    course_id: UUID4
    name: str
    level: Optional[str] = None
    duration_months: Optional[int] = None
    fees: Optional[float] = None
    intake: Optional[int] = None


class ComparisonCutoff(BaseModel):
    course_name: str
    exam_name: Optional[str] = None
    year: int
    category: Optional[str] = None
    opening_rank: Optional[int] = None
    closing_rank: Optional[int] = None


class ComparisonReview(BaseModel):
    id: UUID4
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime


class ComparisonCollege(BaseModel):
    id: UUID4
    name: str
    slug: str
    official_name: Optional[str] = None
    college_type: Optional[str] = None
    is_private: bool = True
    accreditation: Optional[str] = None
    recognition: Optional[str] = None
    established_year: Optional[int] = None
    university_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    entrance_exam: Optional[str] = None
    admission_status: Optional[str] = None
    has_hostel: bool = False
    rating: Optional[float] = None
    courses: List[ComparisonCourse] = []
    cutoffs: List[ComparisonCutoff] = []
    facilities: List[str] = []
    reviews: List[ComparisonReview] = []
    eligibility: Optional[str] = None
    admission_process: Optional[str] = None
    verification_status: Optional[str] = None
    source_name: Optional[str] = None
    last_verified_at: Optional[datetime] = None


class ComparisonResponse(BaseModel):
    colleges: List[ComparisonCollege]
    course_id: Optional[UUID4] = None
    disclaimer: str = COMPARISON_DISCLAIMER


# ---- "Ask AI: Which college is better for me?" ----
# Deterministic, rules-based analysis over verified DB fields only. The output
# contract is stable so an LLM service can replace the scorer later (Phase 26)
# without changing the frontend.

class ComparisonPreferences(BaseModel):
    course: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    requires_hostel: Optional[bool] = None
    prefers_govt: Optional[bool] = None
    state: Optional[str] = None
    city: Optional[str] = None


class AICompareRequest(BaseModel):
    college_ids: List[UUID4] = Field(..., min_length=1, max_length=4)
    preferences: Optional[ComparisonPreferences] = Field(
        default_factory=ComparisonPreferences
    )


class AICollegeAnalysis(BaseModel):
    college_id: UUID4
    name: str
    slug: str
    tier: Literal["HIGHLY_SUITABLE", "POSSIBLE", "REACH"]
    score: int = Field(..., ge=0, le=100)
    summary: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    sources: List[str] = []


class AICompareResponse(BaseModel):
    colleges: List[AICollegeAnalysis]
    overall_summary: str
    disclaimer: str = (
        "This is an automated estimate based only on Padhaanewala's verified database. "
        "It helps you shortlist colleges - it is NOT an admission guarantee and does "
        "not replace official eligibility and admission rules."
    )