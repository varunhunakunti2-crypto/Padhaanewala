from pydantic import BaseModel
from typing import Optional

class ScholarshipBase(BaseModel):
    pass

class ScholarshipCreate(ScholarshipBase):
    pass

class ScholarshipUpdate(ScholarshipBase):
    pass

class ScholarshipResponse(ScholarshipBase):
    id: str
    
    class Config:
        from_attributes = True
