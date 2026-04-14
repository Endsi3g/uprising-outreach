"""Integration tests for leads API."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_lead(client: AsyncClient, workspace_and_token: dict):
    headers = workspace_and_token["auth_headers"]

    response = await client.post("/api/v1/leads", headers=headers, json={
        "source": "manual",
        "notes": "Test lead",
    })
    assert response.status_code == 201
    lead = response.json()
    assert lead["status"] == "raw"
    assert lead["source"] == "manual"

    list_response = await client.get("/api/v1/leads", headers=headers)
    assert list_response.status_code == 200
    data = list_response.json()
    assert data["pagination"]["total_count"] >= 1
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
async def test_update_lead_status(client: AsyncClient, workspace_and_token: dict):
    headers = workspace_and_token["auth_headers"]

    create_response = await client.post("/api/v1/leads", headers=headers, json={})
    lead_id = create_response.json()["id"]

    patch_response = await client.patch(
        f"/api/v1/leads/{lead_id}",
        headers=headers,
        json={"status": "enriched", "score": 75},
    )
    assert patch_response.status_code == 200
    updated = patch_response.json()
    assert updated["status"] == "enriched"
    assert updated["score"] == 75


@pytest.mark.asyncio
async def test_delete_lead_soft_deletes(client: AsyncClient, workspace_and_token: dict):
    headers = workspace_and_token["auth_headers"]

    create_response = await client.post("/api/v1/leads", headers=headers, json={})
    lead_id = create_response.json()["id"]

    delete_response = await client.delete(f"/api/v1/leads/{lead_id}", headers=headers)
    assert delete_response.status_code == 204

    get_response = await client.get(f"/api/v1/leads/{lead_id}", headers=headers)
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_leads_require_auth(client: AsyncClient):
    response = await client.get("/api/v1/leads")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_bulk_action_suppress(client: AsyncClient, workspace_and_token: dict):
    headers = workspace_and_token["auth_headers"]

    # Create 3 leads
    ids = []
    for _ in range(3):
        r = await client.post("/api/v1/leads", headers=headers, json={})
        ids.append(r.json()["id"])

    response = await client.post(
        "/api/v1/leads/bulk-action",
        headers=headers,
        json={"action": "suppress", "lead_ids": ids},
    )
    assert response.status_code == 200
    result = response.json()
    assert result["action"] == "suppress"
    assert result["processed"] == 3


@pytest.mark.asyncio
async def test_lead_filter_by_status(client: AsyncClient, workspace_and_token: dict):
    headers = workspace_and_token["auth_headers"]

    r = await client.post("/api/v1/leads", headers=headers, json={})
    lead_id = r.json()["id"]
    await client.patch(f"/api/v1/leads/{lead_id}", headers=headers, json={"status": "scored"})

    response = await client.get("/api/v1/leads?status=scored", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert all(l["status"] == "scored" for l in data)
