from pydantic import BaseModel
from typing import Optional

class BannerBase(BaseModel):
    pass

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BannerBase):
    pass

class BannerResponse(BannerBase):
    id: str
    
    class Config:
        from_attributes = True
