import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.session import SessionLocal, get_db

@pytest_asyncio.fixture(scope="function")
async def db_session():
    # Use actual DB for this scaffold test, but create a fresh session per test
    # In a fully baked app, you'd use a test DB or transactions.
    async with SessionLocal() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_db():
        # Yield a new session for each request so asyncpg doesn't complain about concurrent operations
        async with SessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
        
    app.dependency_overrides.clear()
