from pydantic import BaseModel
from typing import Optional

class BlogBase(BaseModel):
    pass

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: str
    
    class Config:
        from_attributes = True
