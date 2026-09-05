from pydantic import BaseModel
from typing import Optional

class AnalyticBase(BaseModel):
    pass

class AnalyticCreate(AnalyticBase):
    pass

class AnalyticUpdate(AnalyticBase):
    pass

class AnalyticResponse(AnalyticBase):
    id: str
    
    class Config:
        from_attributes = True
