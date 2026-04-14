"""
AuditLogMiddleware: after each mutating request (POST/PATCH/PUT/DELETE),
emits an entry to the activity_log table via a background task.
This is a best-effort log — failures do not affect the response.
"""

import logging
import uuid
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

AUDIT_METHODS = {"POST", "PATCH", "PUT", "DELETE"}
SKIP_PATHS = {"/health", "/api/docs", "/api/redoc", "/openapi.json"}


class AuditLogMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        if (
            request.method in AUDIT_METHODS
            and request.url.path not in SKIP_PATHS
            and response.status_code < 400
            and hasattr(request.state, "workspace_id")
            and request.state.workspace_id
        ):
            # Fire-and-forget — don't await to avoid slowing response
            import asyncio
            asyncio.create_task(
                self._log(
                    workspace_id=request.state.workspace_id,
                    user_id=getattr(request.state, "user_id", None),
                    method=request.method,
                    path=request.url.path,
                    status_code=response.status_code,
                )
            )

        return response

    async def _log(
        self,
        workspace_id: str,
        user_id: str | None,
        method: str,
        path: str,
        status_code: int,
    ) -> None:
        try:
            from app.database import AsyncSessionLocal
            from app.leads.models import ActivityLog

            async with AsyncSessionLocal() as db:
                entry = ActivityLog(
                    id=uuid.uuid4(),
                    workspace_id=uuid.UUID(workspace_id),
                    entity_type="http_request",
                    entity_id=uuid.uuid4(),
                    actor_id=uuid.UUID(user_id) if user_id else None,
                    event_type=f"{method.lower()}.{path.strip('/').replace('/', '.')}",
                    payload={"path": path, "method": method, "status": status_code},
                )
                db.add(entry)
                await db.commit()
        except Exception as e:
            logger.warning("AuditLog failed (non-critical): %s", e)
