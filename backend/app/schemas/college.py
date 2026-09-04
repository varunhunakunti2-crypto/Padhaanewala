from typing import Optional
from pydantic import BaseModel, UUID4, ConfigDict, Field
from datetime import datetime


class CollegeBase(BaseModel):
    name: str
    college_code: str
    slug: Optional[str] = None
    official_name: Optional[str] = None
    college_type: Optional[str] = None
    is_private: bool = True
    accreditation: Optional[str] = None
    recognition: Optional[str] = None
    established_year: Optional[int] = None
    university_id: Optional[UUID4] = None
    location_id: Optional[UUID4] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    admission_status: Optional[str] = None
    has_hostel: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    is_published: bool = False

    # from ScrapedDataMixin
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    verification_status: Optional[str] = None


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    college_code: Optional[str] = None
    slug: Optional[str] = None
    official_name: Optional[str] = None
    college_type: Optional[str] = None
    is_private: Optional[bool] = None
    accreditation: Optional[str] = None
    recognition: Optional[str] = None
    established_year: Optional[int] = None
    university_id: Optional[UUID4] = None
    location_id: Optional[UUID4] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    admission_status: Optional[str] = None
    has_hostel: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    google_maps_url: Optional[str] = None
    google_place_id: Optional[str] = None
    is_published: Optional[bool] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    verification_status: Optional[str] = None


class CollegeRead(CollegeBase):
    id: UUID4
    rating: Optional[float] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: Optional[str] = None
    last_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CollegePublishUpdate(BaseModel):
    is_published: bool = Field(..., description="Publish/unpublish a college")


class CollegeVerifyUpdate(BaseModel):
    verification_status: Optional[str] = Field(
        None, description="e.g. unverified, pending, verified"
    )
    last_verified_at: Optional[datetime] = None
    verified_by: Optional[UUID4] = Field(None, description="User id doing the verification")
