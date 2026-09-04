from typing import Optional, List
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# --- CMS section CRUD (admin, Phase 19) ---

class HomepageSectionBase(BaseModel):
    section: str = Field(..., description="Unique section key e.g. hero, quick_actions, why_us")
    title: Optional[str] = None
    content: dict = Field(default_factory=dict)
    is_active: bool = True
    order: int = 0


class HomepageSectionCreate(HomepageSectionBase):
    pass


class HomepageSectionUpdate(BaseModel):
    section: Optional[str] = None
    title: Optional[str] = None
    content: Optional[dict] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class HomepageSectionRead(HomepageSectionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Assembled public homepage ---

class HeroContent(BaseModel):
    heading: str = "Find the Right College for Your Future"
    subtitle: str = ""
    search_placeholder: str = "Search colleges, courses, exams or locations"
    search_button_label: str = "Search"
    predictor_button_label: str = "AI College Predictor"


class QuickActionItem(BaseModel):
    label: str
    href: str
    description: Optional[str] = None
    icon: Optional[str] = None


class PopularCourseItem(BaseModel):
    id: uuid.UUID
    name: str
    level: Optional[str] = None
    colleges_count: int = 0


class FeaturedCollegeItem(BaseModel):
    id: uuid.UUID
    name: str
    college_code: str
    state: Optional[str] = None
    city: Optional[str] = None


class PopularSearchItem(BaseModel):
    label: str
    query: str
    href: Optional[str] = None


class WhyUsItem(BaseModel):
    title: str
    description: str = ""
    icon: Optional[str] = None


class CTAContent(BaseModel):
    title: str = ""
    subtitle: str = ""
    button_label: str = "Get Admission Assistance"
    button_href: str = "/contact"


class ScholarshipSummary(BaseModel):
    id: uuid.UUID
    name: str
    provider_name: str
    amount: Optional[float] = None


class UpcomingExamItem(BaseModel):
    id: uuid.UUID
    name: str
    event_name: str
    event_date: Optional[str] = None


class MockTestItem(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None


class ReviewItem(BaseModel):
    id: uuid.UUID
    college_name: str
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None


class ArticleItem(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: Optional[str] = None


class HomepageResponse(BaseModel):
    hero: HeroContent = HeroContent()
    quick_actions: List[QuickActionItem] = []
    popular_courses: List[PopularCourseItem] = []
    featured_colleges: List[FeaturedCollegeItem] = []
    popular_searches: List[PopularSearchItem] = []
    scholarships: List[ScholarshipSummary] = []
    upcoming_exams: List[UpcomingExamItem] = []
    mock_tests: List[MockTestItem] = []
    why_us: List[WhyUsItem] = []
    reviews: List[ReviewItem] = []
    articles: List[ArticleItem] = []
    cta: CTAContent = CTAContent()