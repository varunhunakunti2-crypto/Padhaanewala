from pydantic import BaseModel
from typing import Optional

class Mock_testBase(BaseModel):
    pass

class Mock_testCreate(Mock_testBase):
    pass

class Mock_testUpdate(Mock_testBase):
    pass

class Mock_testResponse(Mock_testBase):
    id: str
    
    class Config:
        from_attributes = True
