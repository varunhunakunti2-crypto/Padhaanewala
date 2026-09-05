from pydantic import BaseModel
from typing import Optional

class UniversitieBase(BaseModel):
    pass

class UniversitieCreate(UniversitieBase):
    pass

class UniversitieUpdate(UniversitieBase):
    pass

class UniversitieResponse(UniversitieBase):
    id: str
    
    class Config:
        from_attributes = True
