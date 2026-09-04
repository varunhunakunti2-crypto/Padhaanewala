from typing import Optional
from pydantic import BaseModel, UUID4, ConfigDict
from datetime import datetime

class CollegeBase(BaseModel):
    name: str
    college_code: str
    university_id: Optional[UUID4] = None
    location_id: Optional[UUID4] = None
    
    # from ScrapedDataMixin
    source_url: Optional[str] = None
    source_name: Optional[str] = None

class CollegeCreate(CollegeBase):
    pass

class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    college_code: Optional[str] = None
    university_id: Optional[UUID4] = None
    location_id: Optional[UUID4] = None

class CollegeRead(CollegeBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
