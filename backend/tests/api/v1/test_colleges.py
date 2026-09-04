import pytest
import uuid
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

async def test_create_college(client: AsyncClient):
    code = f"TEST-{uuid.uuid4().hex[:6]}"
    college_data = {
        "name": "Test Engineering College",
        "college_code": code,
    }
    response = await client.post("/api/v1/colleges/", json=college_data)
    assert response.status_code == 201
    content = response.json()
    assert content["success"] is True
    assert content["data"]["name"] == "Test Engineering College"
    assert content["data"]["college_code"] == code
    assert "id" in content["data"]

async def test_create_duplicate_college(client: AsyncClient):
    code = f"DUP-{uuid.uuid4().hex[:6]}"
    college_data = {
        "name": "Test Engineering College",
        "college_code": code,
    }
    # Create first time
    await client.post("/api/v1/colleges/", json=college_data)
    
    # Create second time with same code
    response = await client.post("/api/v1/colleges/", json=college_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

async def test_get_colleges_pagination(client: AsyncClient):
    # Insert a few colleges
    for i in range(5):
        code = f"C{i}-{uuid.uuid4().hex[:6]}"
        await client.post(
            "/api/v1/colleges/", 
            json={"name": f"College {i}", "college_code": code}
        )
    
    response = await client.get("/api/v1/colleges/?page=1&size=3")
    assert response.status_code == 200
    content = response.json()
    assert content["success"] is True
    assert content["data"]["total"] >= 5
    assert len(content["data"]["items"]) == 3
    assert content["data"]["page"] == 1
    assert content["data"]["size"] == 3
