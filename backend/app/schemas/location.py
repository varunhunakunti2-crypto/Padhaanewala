from pydantic import BaseModel
from typing import Optional

class LocationBase(BaseModel):
    pass

class LocationCreate(LocationBase):
    pass

class LocationUpdate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: str
    
    class Config:
        from_attributes = True
