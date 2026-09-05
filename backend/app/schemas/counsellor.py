from pydantic import BaseModel
from typing import Optional

class CounsellorBase(BaseModel):
    pass

class CounsellorCreate(CounsellorBase):
    pass

class CounsellorUpdate(CounsellorBase):
    pass

class CounsellorResponse(CounsellorBase):
    id: str
    
    class Config:
        from_attributes = True
