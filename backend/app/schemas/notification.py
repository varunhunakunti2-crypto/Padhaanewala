from pydantic import BaseModel
from typing import Optional

class NotificationBase(BaseModel):
    pass

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    
    class Config:
        from_attributes = True
