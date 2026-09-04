import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.core.security import get_password_hash

pytestmark = pytest.mark.asyncio

async def test_register_new_user(client: AsyncClient, db_session: AsyncSession):
    data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "phone": "+1234567890"
    }
    response = await client.post("/api/v1/auth/register", json=data)
    assert response.status_code == 201
    content = response.json()
    assert content["email"] == data["email"]
    assert content["phone"] == data["phone"]
    assert "id" in content

async def test_register_existing_user(client: AsyncClient, db_session: AsyncSession):
    # First user
    data = {
        "email": "duplicate@example.com",
        "password": "testpassword123",
    }
    await client.post("/api/v1/auth/register", json=data)
    
    # Try to register again
    response = await client.post("/api/v1/auth/register", json=data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    # Setup user
    email = "login@example.com"
    password = "loginpassword123"
    
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    await db_session.commit()

    # Login
    response = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": email, "password": password}
    )
    
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"

async def test_login_invalid_credentials(client: AsyncClient, db_session: AsyncSession):
    response = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"
