from pydantic import BaseModel
from typing import Optional

class ReviewBase(BaseModel):
    pass

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    
    class Config:
        from_attributes = True
