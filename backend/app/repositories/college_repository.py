from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.education import College
from app.schemas.college import CollegeCreate, CollegeUpdate
from app.repositories.base import BaseRepository

class CollegeRepository(BaseRepository[College, CollegeCreate, CollegeUpdate]):
    async def get_by_code(self, session: AsyncSession, college_code: str) -> College | None:
        query = select(College).where(College.college_code == college_code)
        result = await session.execute(query)
        return result.scalar_one_or_none()
        
    def get_query(self, search: str | None = None):
        """Return a query object suitable for pagination."""
        query = select(College)
        if search:
            query = query.where(College.name.ilike(f"%{search}%"))
        return query

college_repository = CollegeRepository(College)
