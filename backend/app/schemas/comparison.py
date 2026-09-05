from pydantic import BaseModel
from typing import Optional

class ComparisonBase(BaseModel):
    pass

class ComparisonCreate(ComparisonBase):
    pass

class ComparisonUpdate(ComparisonBase):
    pass

class ComparisonResponse(ComparisonBase):
    id: str
    
    class Config:
        from_attributes = True
