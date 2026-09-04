import math
from typing import TypeVar, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.common import PaginatedData

ModelType = TypeVar("ModelType")

async def paginate(
    session: AsyncSession,
    query: select,
    page: int = 1,
    size: int = 20
) -> PaginatedData[ModelType]:
    # Calculate total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar_one()

    # Apply pagination
    offset = (page - 1) * size
    paginated_query = query.offset(offset).limit(size)
    result = await session.execute(paginated_query)
    items = result.scalars().all()

    pages = math.ceil(total / size) if total > 0 else 0

    return PaginatedData(
        items=list(items),
        total=total,
        page=page,
        size=size,
        pages=pages
    )
