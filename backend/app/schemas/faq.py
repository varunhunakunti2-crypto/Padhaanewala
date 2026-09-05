from pydantic import BaseModel
from typing import Optional

class FaqBase(BaseModel):
    pass

class FaqCreate(FaqBase):
    pass

class FaqUpdate(FaqBase):
    pass

class FaqResponse(FaqBase):
    id: str
    
    class Config:
        from_attributes = True
