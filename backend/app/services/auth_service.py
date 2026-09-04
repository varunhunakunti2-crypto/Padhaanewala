from typing import Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.core import security

class AuthService:
    
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        result = await db.execute(select(User).where(User.email == user_in.email))
        if result.scalars().first():
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        
        user = User(
            email=user_in.email,
            phone=user_in.phone,
            password_hash=security.get_password_hash(user_in.password),
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, email: str, password: str) -> Tuple[str, str]:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user or not security.verify_password(password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        elif not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
            
        access_token = security.create_access_token(user.id)
        refresh_token = security.create_refresh_token(user.id)
        
        return access_token, refresh_token
