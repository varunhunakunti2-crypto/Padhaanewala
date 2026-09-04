from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime

class RoleBase(BaseModel):
    name: str

class Role(RoleBase):
    id: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDBBase(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    roles: List[Role] = []
