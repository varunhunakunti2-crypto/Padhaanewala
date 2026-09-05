from pydantic import BaseModel
from typing import Optional

class FacilitieBase(BaseModel):
    pass

class FacilitieCreate(FacilitieBase):
    pass

class FacilitieUpdate(FacilitieBase):
    pass

class FacilitieResponse(FacilitieBase):
    id: str
    
    class Config:
        from_attributes = True
