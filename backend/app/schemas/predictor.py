from pydantic import BaseModel
from typing import Optional

class PredictorBase(BaseModel):
    pass

class PredictorCreate(PredictorBase):
    pass

class PredictorUpdate(PredictorBase):
    pass

class PredictorResponse(PredictorBase):
    id: str
    
    class Config:
        from_attributes = True
