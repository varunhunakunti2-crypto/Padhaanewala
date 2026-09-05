from pydantic import BaseModel
from typing import Optional

class EnquirieBase(BaseModel):
    pass

class EnquirieCreate(EnquirieBase):
    pass

class EnquirieUpdate(EnquirieBase):
    pass

class EnquirieResponse(EnquirieBase):
    id: str
    
    class Config:
        from_attributes = True
