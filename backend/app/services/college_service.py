from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.base import BaseService
from app.models.education import College
from app.schemas.college import CollegeCreate, CollegeUpdate, CollegeRead
from app.repositories.college_repository import college_repository
from app.utils.pagination import paginate
from app.schemas.common import PaginatedData

class CollegeService(BaseService[College, CollegeCreate, CollegeUpdate]):
    async def create(self, session: AsyncSession, obj_in: CollegeCreate) -> College:
        # Check if college code already exists
        existing = await self.repository.get_by_code(session, obj_in.college_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"College with code {obj_in.college_code} already exists."
            )
        return await super().create(session, obj_in)

    async def get_paginated(
        self, session: AsyncSession, page: int, size: int, search: str | None = None
    ) -> PaginatedData[CollegeRead]:
        query = self.repository.get_query(search=search)
        return await paginate(session, query, page, size)

college_service = CollegeService(college_repository)
