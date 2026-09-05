from datetime import datetime
from typing import Optional, List
import uuid
from pydantic import BaseModel, ConfigDict, Field

class CourseBase(BaseModel):
    name: str = Field(..., max_length=255)
    level: Optional[str] = Field(None, max_length=100)
    degree: Optional[str] = Field(None, max_length=255)
    duration_months: Optional[int] = None
    eligibility: Optional[str] = None
    entrance_exam: Optional[str] = Field(None, max_length=255)
    admission_procedure: Optional[str] = None
    career_info: Optional[str] = None
    description: Optional[str] = None
    fee_info: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    is_published: bool = False

class CourseCreate(CourseBase):
    slug: Optional[str] = Field(None, max_length=255)

class CourseUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    level: Optional[str] = Field(None, max_length=100)
    degree: Optional[str] = Field(None, max_length=255)
    duration_months: Optional[int] = None
    eligibility: Optional[str] = None
    entrance_exam: Optional[str] = Field(None, max_length=255)
    admission_procedure: Optional[str] = None
    career_info: Optional[str] = None
    description: Optional[str] = None
    fee_info: Optional[str] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None

class CourseRead(CourseBase):
    id: uuid.UUID
    slug: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CourseCollegeSummary(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    college_type: Optional[str] = None
    is_private: bool
    min_fee: Optional[float] = None
    rating: Optional[float] = None

class CourseDetail(CourseRead):
    colleges: List[CourseCollegeSummary] = []
    colleges_count: int = 0
