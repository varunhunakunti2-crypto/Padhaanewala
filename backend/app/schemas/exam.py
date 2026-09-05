from pydantic import BaseModel
from typing import Optional

class ExamBase(BaseModel):
    pass

class ExamCreate(ExamBase):
    pass

class ExamUpdate(ExamBase):
    pass

class ExamResponse(ExamBase):
    id: str
    
    class Config:
        from_attributes = True
