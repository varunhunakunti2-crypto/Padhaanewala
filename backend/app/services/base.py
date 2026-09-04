from typing import Any, Generic, TypeVar, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from pydantic import BaseModel

from app.models.base import Base
from app.repositories.base import BaseRepository

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: BaseRepository[ModelType, CreateSchemaType, UpdateSchemaType]):
        self.repository = repository

    async def get_or_404(self, session: AsyncSession, id: Any) -> ModelType:
        obj = await self.repository.get(session, id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.repository.model.__name__} not found."
            )
        return obj

    async def create(self, session: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        return await self.repository.create(session, obj_in=obj_in)

    async def update(self, session: AsyncSession, id: Any, obj_in: UpdateSchemaType) -> ModelType:
        db_obj = await self.get_or_404(session, id)
        return await self.repository.update(session, db_obj=db_obj, obj_in=obj_in)

    async def delete(self, session: AsyncSession, id: Any) -> ModelType:
        db_obj = await self.get_or_404(session, id)
        await self.repository.remove(session, id=id)
        return db_obj
