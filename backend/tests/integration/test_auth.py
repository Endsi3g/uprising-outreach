"""Integration tests for auth endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_creates_workspace_and_admin(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "workspace_name": "Acme Corp",
        "workspace_slug": "acme-corp",
        "email": "ceo@acme.com",
        "password": "securepass123",
        "first_name": "John",
        "last_name": "Doe",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_slug_fails(client: AsyncClient):
    payload = {
        "workspace_name": "Duplicate",
        "workspace_slug": "duplicate-slug",
        "email": "user1@test.com",
        "password": "password123",
        "first_name": "A",
        "last_name": "B",
    }
    await client.post("/api/v1/auth/register", json=payload)

    payload["email"] = "user2@test.com"
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_returns_tokens(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "workspace_name": "Login Test",
        "workspace_slug": "login-test",
        "email": "login@test.com",
        "password": "mypassword",
        "first_name": "Login",
        "last_name": "User",
    })

    response = await client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "mypassword",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_user(client: AsyncClient, workspace_and_token: dict):
    response = await client.get(
        "/api/v1/auth/me",
        headers=workspace_and_token["auth_headers"],
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"
