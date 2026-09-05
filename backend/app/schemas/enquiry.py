from typing import Optional
from pydantic import BaseModel, Field

class EnquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    mobile: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = Field(None, max_length=254)
    course: Optional[str] = Field(None, max_length=120)
    preferred_college: Optional[str] = Field(None, max_length=200)
    state: Optional[str] = Field(None, max_length=120)
    message: Optional[str] = Field(None, max_length=2000)
    source: Optional[str] = Field(None, max_length=64)
    utm_source: Optional[str] = Field(None, max_length=128)
    utm_medium: Optional[str] = Field(None, max_length=128)
    utm_campaign: Optional[str] = Field(None, max_length=128)


class EnquiryRead(BaseModel):
    id: str
    name: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None
    course: Optional[str] = None
    preferred_college: Optional[str] = None
    state: Optional[str] = None
    message: str
    status: str
    created_at: object | None = None