"""
WorkspaceScopeMiddleware: decodes JWT on every request and sets
request.state.workspace_id + request.state.current_user_id.

This runs before route handlers so all downstream code can trust
request.state.workspace_id is set (or the request is rejected with 401).

Paths in EXEMPT_PATHS bypass auth (health check, auth endpoints).
"""

import logging
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from jose import JWTError

from app.auth.security import decode_token

logger = logging.getLogger(__name__)

EXEMPT_PATHS = {
    "/health",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/refresh",
    "/api/docs",
    "/api/redoc",
    "/openapi.json",
}


class WorkspaceScopeMiddleware:
    def __init__(self, app: Callable) -> None:
        self.app = app

    async def __call__(self, scope: dict, receive: Callable, send: Callable) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive)

        if request.url.path in EXEMPT_PATHS:
            await self.app(scope, receive, send)
            return

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            response = Response(
                content='{"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}',
                status_code=401,
                media_type="application/json",
            )
            await response(scope, receive, send)
            return

        token = auth_header.removeprefix("Bearer ")
        try:
            payload = decode_token(token)
        except (ValueError, JWTError):
            response = Response(
                content='{"error":{"code":"UNAUTHORIZED","message":"Invalid or expired token","details":{}}}',
                status_code=401,
                media_type="application/json",
            )
            await response(scope, receive, send)
            return

        scope["state"]["workspace_id"] = payload.get("workspace_id")
        scope["state"]["user_id"] = payload.get("sub")
        scope["state"]["user_role"] = payload.get("role")

        await self.app(scope, receive, send)
