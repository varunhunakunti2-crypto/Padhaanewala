from pydantic import BaseModel
from typing import Optional

class AiBase(BaseModel):
    pass

class AiCreate(AiBase):
    pass

class AiUpdate(AiBase):
    pass

class AiResponse(AiBase):
    id: str
    
    class Config:
        from_attributes = True
