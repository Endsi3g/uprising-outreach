"""Webhook endpoints for Facebook / Meta platform."""

from __future__ import annotations

import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.webhooks import facebook as fb_handlers

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


# ---------------------------------------------------------------------------
# Facebook hub challenge verification (subscription setup)
# ---------------------------------------------------------------------------


@router.get("/facebook", response_class=PlainTextResponse)
async def facebook_verify(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_verify_token: str | None = Query(default=None, alias="hub.verify_token"),
    hub_challenge: str | None = Query(default=None, alias="hub.challenge"),
) -> str:
    """Respond to Facebook's webhook subscription verification request."""
    if hub_mode == "subscribe" and hub_verify_token == settings.facebook_webhook_verify_token:
        return hub_challenge or ""
    raise HTTPException(status_code=403, detail="Invalid verify token")


# ---------------------------------------------------------------------------
# Facebook event dispatcher
# ---------------------------------------------------------------------------


@router.post("/facebook", status_code=200)
async def facebook_events(
    request: Request,
    x_hub_signature_256: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Receive and dispatch Facebook webhook events.

    Validates the X-Hub-Signature-256 header, then routes each entry to
    the appropriate handler (messaging → Inbox, leadgen → Lead import).
    """
    body = await request.body()

    # Signature verification
    if settings.facebook_app_secret:
        if not x_hub_signature_256:
            raise HTTPException(status_code=400, detail="Missing X-Hub-Signature-256 header")
        _verify_signature(body, x_hub_signature_256, settings.facebook_app_secret)

    payload: dict = await request.json() if not body else __import__("json").loads(body)

    if payload.get("object") != "page":
        return {"status": "ignored", "reason": "not a page event"}

    for entry in payload.get("entry", []):
        page_id: str = entry.get("id", "")

        # Determine which workspace owns this page
        workspace_id = await _resolve_workspace(db, page_id)
        if workspace_id is None:
            logger.warning("Received Facebook event for unknown page %s — skipping", page_id)
            continue

        # Messenger messages
        for messaging in entry.get("messaging", []):
            try:
                await fb_handlers.handle_messaging_event(db, workspace_id, page_id, messaging)
            except Exception:
                logger.exception("Error handling messaging event for page %s", page_id)

        # Lead Ads
        for change in entry.get("changes", []):
            if change.get("field") == "leadgen":
                try:
                    await fb_handlers.handle_leadgen_event(
                        db, workspace_id, page_id, change.get("value", {})
                    )
                except Exception:
                    logger.exception("Error handling leadgen event for page %s", page_id)

    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _verify_signature(body: bytes, signature_header: str, app_secret: str) -> None:
    """Raise HTTP 400 if the payload signature does not match."""
    expected_prefix = "sha256="
    if not signature_header.startswith(expected_prefix):
        raise HTTPException(status_code=400, detail="Malformed signature header")

    expected_digest = signature_header[len(expected_prefix):]
    computed = hmac.new(app_secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, expected_digest):
        raise HTTPException(status_code=400, detail="Signature mismatch")


async def _resolve_workspace(db: AsyncSession, page_id: str):  # type: ignore[return]
    """Return the workspace_id that owns this Facebook page, or None."""
    from sqlalchemy import select
    from app.senders.models import EmailProvider, SenderAccount

    result = await db.execute(
        select(SenderAccount.workspace_id).where(
            SenderAccount.provider == EmailProvider.FACEBOOK,
            SenderAccount.email_address == page_id,
            SenderAccount.deleted_at.is_(None),
        )
    )
    return result.scalar_one_or_none()
