from pydantic import BaseModel
from typing import Optional

class LeadBase(BaseModel):
    pass

class LeadCreate(LeadBase):
    pass

class LeadUpdate(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: str
    
    class Config:
        from_attributes = True
