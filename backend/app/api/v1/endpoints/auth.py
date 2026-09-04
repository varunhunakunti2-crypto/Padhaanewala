from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.token import Token
from app.core import security

from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    user = await AuthService.register_user(db, user_in)
    # Build the response from scalar fields only: the ORM `roles` relationship
    # is async-lazy (would raise MissingGreenlet during response serialization)
    # and the UUID `id` must be stringified for the schema.
    return UserSchema(
        id=str(user.id),
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        roles=[],
    )

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    access_token, refresh_token = await AuthService.authenticate_user(
        db, form_data.username, form_data.password
    )
        
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }
