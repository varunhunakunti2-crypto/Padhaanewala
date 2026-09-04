from typing import Literal, Optional, List
from pydantic import (
    BaseModel,
    UUID4,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)
from datetime import datetime

VERIFICATION_STATUSES = {"unverified", "pending", "verified"}
ADMISSION_STATUSES = {"open", "closed", "tentative"}
PHONE_PATTERN_HINT = "Use a valid phone number (10-12 digits, optional +91/0 prefix)"


def _clean_phone(value: str | None) -> str | None:
    if value is None:
        return None
    digits = "".join(ch for ch in value if ch.isdigit())
    if len(digits) < 10 or len(digits) > 12:
        raise ValueError(PHONE_PATTERN_HINT)
    return digits


class CollegeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200, description="Short display name")
    college_code: str = Field(..., min_length=3, max_length=50, description="Unique code e.g. COLLEGE000001")
    slug: Optional[str] = None
    official_name: Optional[str] = Field(None, max_length=300)
    college_type: Optional[str] = Field(None, max_length=100, description="e.g. dental, medical, engineering")
    is_private: bool = True
    accreditation: Optional[str] = Field(None, max_length=100)
    recognition: Optional[str] = Field(None, max_length=200)
    established_year: Optional[int] = Field(None, ge=1000)
    university_id: Optional[UUID4] = None
    university_name: Optional[str] = Field(None, max_length=200, description="Resolved to a University by name")
    location_id: Optional[UUID4] = None
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    entrance_exam: Optional[str] = Field(None, max_length=200)
    admission_status: Optional[str] = Field(None, description="open / closed / tentative")
    has_hostel: bool = False
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    google_maps_url: Optional[str] = Field(None, max_length=500)
    google_place_id: Optional[str] = Field(None, max_length=300)
    is_published: bool = False
    rating: Optional[float] = Field(None, ge=0, le=5)

    # from ScrapedDataMixin
    source_url: Optional[str] = Field(None, max_length=500)
    source_name: Optional[str] = Field(None, max_length=200)
    verification_status: Optional[str] = Field(
        None, description="unverified / pending / verified"
    )

    @field_validator("verification_status")
    @classmethod
    def _validate_verification_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in VERIFICATION_STATUSES:
            raise ValueError(f"verification_status must be one of {sorted(VERIFICATION_STATUSES)}")
        return stripped

    @field_validator("admission_status")
    @classmethod
    def _validate_admission_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in ADMISSION_STATUSES:
            raise ValueError(f"admission_status must be one of {sorted(ADMISSION_STATUSES)}")
        return stripped

    @field_validator("pincode")
    @classmethod
    def _validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("pincode must be a 6-digit Indian postal code")
        return v

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return _clean_phone(v.strip() if isinstance(v, str) else None)

    @field_validator("website", "google_maps_url")
    @classmethod
    def _validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        url = v.strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            raise ValueError("URL must start with http:// or https://")
        return url

    @field_validator("established_year")
    @classmethod
    def _validate_year(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        current = datetime.now().year
        if not (1000 <= v <= current + 1):
            raise ValueError(f"established_year must be between 1000 and {current + 1}")
        return v


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    college_code: Optional[str] = Field(None, min_length=3, max_length=50)
    slug: Optional[str] = None
    official_name: Optional[str] = Field(None, max_length=300)
    college_type: Optional[str] = Field(None, max_length=100)
    is_private: Optional[bool] = None
    accreditation: Optional[str] = Field(None, max_length=100)
    recognition: Optional[str] = Field(None, max_length=200)
    established_year: Optional[int] = Field(None, ge=1000)
    university_id: Optional[UUID4] = None
    university_name: Optional[str] = Field(None, max_length=200)
    location_id: Optional[UUID4] = None
    state: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    entrance_exam: Optional[str] = Field(None, max_length=200)
    admission_status: Optional[str] = None
    has_hostel: Optional[bool] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    google_maps_url: Optional[str] = Field(None, max_length=500)
    google_place_id: Optional[str] = Field(None, max_length=300)
    is_published: Optional[bool] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    source_url: Optional[str] = Field(None, max_length=500)
    source_name: Optional[str] = Field(None, max_length=200)
    verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None

    @field_validator("verification_status")
    @classmethod
    def _validate_verification_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in VERIFICATION_STATUSES:
            raise ValueError(f"verification_status must be one of {sorted(VERIFICATION_STATUSES)}")
        return stripped

    @field_validator("admission_status")
    @classmethod
    def _validate_admission_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in ADMISSION_STATUSES:
            raise ValueError(f"admission_status must be one of {sorted(ADMISSION_STATUSES)}")
        return stripped

    @field_validator("pincode")
    @classmethod
    def _validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v.isdigit() or len(v) != 6:
            raise ValueError("pincode must be a 6-digit Indian postal code")
        return v

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return _clean_phone(v.strip() if isinstance(v, str) else None)

    @field_validator("website", "google_maps_url")
    @classmethod
    def _validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        url = v.strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            raise ValueError("URL must start with http:// or https://")
        return url

    @field_validator("established_year")
    @classmethod
    def _validate_year(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        current = datetime.now().year
        if not (1000 <= v <= current + 1):
            raise ValueError(f"established_year must be between 1000 and {current + 1}")
        return v


class CollegeRead(BaseModel):
    id: UUID4
    name: str
    college_code: str
    slug: str
    official_name: Optional[str] = None
    college_type: Optional[str] = None
    is_private: bool = True
    accreditation: Optional[str] = None
    recognition: Optional[str] = None
    established_year: Optional[int] = None
    university_id: Optional[UUID4] = None
    university_name: Optional[str] = None
    location_id: Optional[UUID4] = None
    location: Optional[dict] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    entrance_exam: Optional[str] = None
    admission_status: Optional[str] = None
    has_hostel: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    is_published: bool = False
    rating: Optional[float] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None
    course_names: List[str] = []
    min_fee: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CollegePublishUpdate(BaseModel):
    is_published: bool = Field(..., description="Publish/unpublish a college")


class CollegeVerifyUpdate(BaseModel):
    verification_status: Optional[str] = Field(
        None, description="unverified / pending / verified"
    )
    last_verified_at: Optional[datetime] = None
    verified_by: Optional[UUID4] = Field(None, description="User id doing the verification")

    @field_validator("verification_status")
    @classmethod
    def _validate_verification_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in VERIFICATION_STATUSES:
            raise ValueError(f"verification_status must be one of {sorted(VERIFICATION_STATUSES)}")
        return stripped


class CollegeBulkAction(BaseModel):
    ids: List[UUID4] = Field(..., min_length=1)


class CollegeBulkPublish(CollegeBulkAction):
    is_published: bool = Field(..., description="Publish or unpublish the selected colleges")


class CollegeBulkVerify(CollegeBulkAction):
    verification_status: Optional[str] = Field(
        None, description="unverified / pending / verified"
    )
    last_verified_at: Optional[datetime] = None

    @field_validator("verification_status")
    @classmethod
    def _validate_verification_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip().lower()
        if stripped not in VERIFICATION_STATUSES:
            raise ValueError(f"verification_status must be one of {sorted(VERIFICATION_STATUSES)}")
        return stripped


# ---- Detail (public college detail page) ----

class CollegeCourseDetail(BaseModel):
    course_id: UUID4
    course_name: str
    level: Optional[str] = None
    fees: Optional[float] = None
    duration_months: Optional[int] = None
    intake: Optional[int] = None


class CollegeFacilityDetail(BaseModel):
    name: str


class CollegeReviewDetail(BaseModel):
    id: UUID4
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime


class CollegeFaqDetail(BaseModel):
    question: str
    answer: str


class CollegeCutoffDetail(BaseModel):
    course_name: str
    exam_name: Optional[str] = None
    year: int
    category: Optional[str] = None
    opening_rank: Optional[int] = None
    closing_rank: Optional[int] = None


class CollegeMediaDetail(BaseModel):
    url: str
    alt_text: Optional[str] = None
    image_type: Optional[str] = None


class CollegeDetail(CollegeRead):
    university_name: Optional[str] = None
    location: Optional[dict] = None
    courses: List[CollegeCourseDetail] = []
    facilities: List[CollegeFacilityDetail] = []
    reviews: List[CollegeReviewDetail] = []
    faqs: List[CollegeFaqDetail] = []
    cutoffs: List[CollegeCutoffDetail] = []
    gallery: List[CollegeMediaDetail] = []
    eligibility: Optional[str] = None
    admission_process: Optional[str] = None


# ---- Phase 08: search, facets, suggestions ----

CollegeSortValue = Literal["relevance", "name", "rating", "fees_asc", "fees_desc"]


class FacetBucket(BaseModel):
    label: str
    count: int


class CollegeFacets(BaseModel):
    total: int = 0
    states: List[FacetBucket] = []
    districts: List[FacetBucket] = []
    cities: List[FacetBucket] = []
    college_types: List[FacetBucket] = []
    courses: List[FacetBucket] = []
    universities: List[FacetBucket] = []
    accreditation: List[FacetBucket] = []
    admission_statuses: List[FacetBucket] = []


class SuggestionItem(BaseModel):
    type: Literal["college", "course", "exam", "state", "district", "city"]
    label: str
    value: str
    sublabel: Optional[str] = None


class SearchSuggestions(BaseModel):
    query: str
    colleges: List[SuggestionItem] = []
    courses: List[SuggestionItem] = []
    exams: List[SuggestionItem] = []
    locations: List[SuggestionItem] = []