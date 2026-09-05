from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, UUID4, field_validator


SCHOLARSHIP_STATUSES = ("active", "expired", "draft")
VERIFICATION_STATUSES = ("unverified", "pending", "verified")


class ScholarshipBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    provider_name: str = Field(..., min_length=2, max_length=255)
    is_government: bool = False
    amount: Optional[float] = Field(None, ge=0)
    eligibility_criteria: Optional[str] = Field(None, max_length=10000)
    income_criteria: Optional[str] = Field(None, max_length=2000)
    deadline: Optional[date] = None
    documents: Optional[str] = Field(None, max_length=5000)
    application_procedure: Optional[str] = Field(None, max_length=5000)
    official_application_url: Optional[str] = Field(None, max_length=500)
    status: str = "active"
    states: List[str] = []
    course_ids: List[UUID4] = []

    @field_validator("status")
    @classmethod
    def _validate_status(cls, v: str) -> str:
        stripped = v.strip().lower()
        if stripped not in SCHOLARSHIP_STATUSES:
            raise ValueError(f"status must be one of {sorted(SCHOLARSHIP_STATUSES)}")
        return stripped

    @field_validator("official_application_url")
    @classmethod
    def _validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        url = v.strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            raise ValueError("official_application_url must start with http:// or https://")
        return url


class ScholarshipCreate(ScholarshipBase):
    pass


class ScholarshipUpdate(ScholarshipBase):
    pass


class ScholarshipPublishUpdate(BaseModel):
    status: str


class ScholarshipVerifyUpdate(BaseModel):
    verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None

    @field_validator("verification_status")
    @classmethod
    def _validate(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in VERIFICATION_STATUSES:
            raise ValueError(f"verification_status must be one of {sorted(VERIFICATION_STATUSES)}")
        return stripped


class ScholarshipRead(BaseModel):
    id: UUID4
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    provider_name: str
    is_government: bool = False
    amount: Optional[float] = None
    eligibility_criteria: Optional[str] = None
    income_criteria: Optional[str] = None
    deadline: Optional[date] = None
    documents: Optional[str] = None
    application_procedure: Optional[str] = None
    official_application_url: Optional[str] = None
    status: str = "active"
    states: List[str] = []
    course_names: List[str] = []
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScholarshipDetail(ScholarshipRead):
    course_ids: List[UUID4] = []


class ScholarshipFacetBucket(BaseModel):
    label: str
    count: int


class ScholarshipFacets(BaseModel):
    total: int = 0
    states: List[ScholarshipFacetBucket] = []
    courses: List[ScholarshipFacetBucket] = []
    statuses: List[ScholarshipFacetBucket] = []