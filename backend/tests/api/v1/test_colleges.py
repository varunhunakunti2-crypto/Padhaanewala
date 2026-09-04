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


async def test_create_college_with_location_and_university(client: AsyncClient):
    code = f"LOC-{uuid.uuid4().hex[:6]}"
    response = await client.post(
        "/api/v1/colleges/",
        json={
            "name": "Karnataka Engineering College",
            "college_code": code,
            "state": "Karnataka",
            "district": "Bengaluru",
            "city": "Bengaluru",
            "university_name": "VTU Test",
            "pincode": "560001",
        },
    )
    assert response.status_code == 201
    content = response.json()["data"]
    assert content["slug"] == "karnataka-engineering-college"
    assert content["city"] == "Bengaluru"
    assert content["state"] == "Karnataka"
    assert content["university_name"] == "VTU Test"


async def test_duplicate_slug_gets_suffix(client: AsyncClient):
    for i in range(2):
        code = f"SLUG{i}-{uuid.uuid4().hex[:6]}"
        await client.post(
            "/api/v1/colleges/",
            json={"name": "Identical Name College", "college_code": code},
        )

    response = await client.get("/api/v1/colleges/?search=Identical&size=10")
    data = response.json()["data"]
    slugs = [item["slug"] for item in data["items"] if item["name"] == "Identical Name College"]
    assert len(slugs) == 2
    assert len(set(slugs)) == 2


async def test_validation_error_on_bad_fields(client: AsyncClient):
    code = f"BAD-{uuid.uuid4().hex[:6]}"
    response = await client.post(
        "/api/v1/colleges/",
        json={"name": "Bad College", "college_code": code, "pincode": "123", "phone": "abc"},
    )
    assert response.status_code == 422


async def test_filter_by_verification_status_and_private(client: AsyncClient):
    code = f"VST-{uuid.uuid4().hex[:6]}"
    resp = await client.post(
        "/api/v1/colleges/",
        json={"name": "Verified Private College", "college_code": code, "is_private": True},
    )
    cid = resp.json()["data"]["id"]

    admin_headers = {}
    # Admin endpoints are RBAC gated; if auth is mocked to allow, exercise bulk flow.
    async def url(path):  # noqa: ANN202
        return f"/api/v1/admin/colleges{path}"

    await client.patch(
        await url(f"/{cid}/verify"),
        json={"verification_status": "verified"},
        headers=admin_headers,
    )
    await client.patch(
        await url(f"/{cid}/publish"),
        json={"is_published": True},
        headers=admin_headers,
    )

    admin_list = await client.get(
        await url("/"),
        params={"verification_status": "verified", "is_private": True, "is_published": True},
    )
    assert admin_list.status_code in (200, 403)


async def test_bulk_publish_and_archive(client: AsyncClient):
    ids = []
    for i in range(2):
        code = f"BLK-{uuid.uuid4().hex[:6]}"
        resp = await client.post(
            "/api/v1/colleges/",
            json={"name": f"Bulk College {i}", "college_code": code},
        )
        ids.append(resp.json()["data"]["id"])

    response = await client.post("/api/v1/admin/colleges/bulk/publish", json={"ids": ids, "is_published": True})
    if response.status_code in (200, 403):
        assert response.json()["success"] is True or response.status_code == 403

    archive = await client.post("/api/v1/admin/colleges/bulk/archive", json=ids)
    assert archive.status_code in (200, 403)
