from pydantic import BaseModel
from typing import Optional

class MediaBase(BaseModel):
    pass

class MediaCreate(MediaBase):
    pass

class MediaUpdate(MediaBase):
    pass

class MediaResponse(MediaBase):
    id: str
    
    class Config:
        from_attributes = True
