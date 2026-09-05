from pydantic import BaseModel
from typing import Optional

class DashboardBase(BaseModel):
    pass

class DashboardCreate(DashboardBase):
    pass

class DashboardUpdate(DashboardBase):
    pass

class DashboardResponse(DashboardBase):
    id: str
    
    class Config:
        from_attributes = True
