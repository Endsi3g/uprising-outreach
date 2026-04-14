"""Inbox service — CRUD operations and Gmail reply."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.inbox.models import InboxConversation, InboxMessage
from app.shared.exceptions import raise_not_found

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------------

async def list_conversations(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    channel: str | None = None,
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[InboxConversation], int]:
    from sqlalchemy import func, select

    base = [InboxConversation.workspace_id == workspace_id]
    if channel:
        base.append(InboxConversation.channel == channel)
    if status:
        base.append(InboxConversation.status == status)

    count_result = await db.execute(
        select(func.count(InboxConversation.id)).where(*base)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(InboxConversation)
        .where(*base)
        .order_by(InboxConversation.last_message_at.desc().nulls_last())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all()), total


async def get_conversation(
    db: AsyncSession, workspace_id: uuid.UUID, conversation_id: uuid.UUID
) -> InboxConversation:
    result = await db.execute(
        select(InboxConversation).where(
            InboxConversation.id == conversation_id,
            InboxConversation.workspace_id == workspace_id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise_not_found("InboxConversation", str(conversation_id))
    return conv  # type: ignore[return-value]


async def get_messages(
    db: AsyncSession, conversation_id: uuid.UUID
) -> list[InboxMessage]:
    result = await db.execute(
        select(InboxMessage)
        .where(InboxMessage.conversation_id == conversation_id)
        .order_by(InboxMessage.sent_at.asc().nulls_last(), InboxMessage.created_at.asc())
    )
    return list(result.scalars().all())


async def update_conversation(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    status: str | None,
    classification: str | None,
) -> InboxConversation:
    conv = await get_conversation(db, workspace_id, conversation_id)
    if status:
        conv.status = status
    if classification:
        conv.classification = classification
    conv.updated_at = datetime.now(UTC)  # type: ignore[assignment]
    await db.commit()
    await db.refresh(conv)
    return conv


# ---------------------------------------------------------------------------
# Reply via Gmail
# ---------------------------------------------------------------------------

async def send_reply(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
    body: str,
) -> InboxMessage:
    conv = await get_conversation(db, workspace_id, conversation_id)

    # Try to send via Gmail if we have an associated sender account
    gmail_message_id: str | None = None
    if conv.sender_account_id and conv.channel == "gmail":
        try:
            gmail_message_id = await _send_gmail_reply(db, conv, body)
        except Exception as exc:
            logger.error("Gmail send failed: %s — saving as outbound draft", exc)

    # Save as outbound message
    msg = InboxMessage(
        conversation_id=conv.id,
        direction="outbound",
        sender_name="",
        sender_email="",
        body_text=body,
        external_message_id=gmail_message_id,
        sent_at=datetime.now(UTC),
    )
    db.add(msg)
    conv.last_message_at = datetime.now(UTC)  # type: ignore[assignment]
    conv.updated_at = datetime.now(UTC)  # type: ignore[assignment]
    await db.commit()
    await db.refresh(msg)
    return msg


async def _send_gmail_reply(
    db: AsyncSession, conv: InboxConversation, body: str
) -> str:
    """Send an email reply via Gmail API. Returns the Gmail message ID."""
    import base64
    import email.mime.text

    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    from app.senders.models import SenderAccount

    result = await db.execute(
        select(SenderAccount).where(SenderAccount.id == conv.sender_account_id)
    )
    sender = result.scalar_one_or_none()
    if not sender or not sender.oauth_access_token:
        raise ValueError("No valid sender account found")

    creds = Credentials(
        token=sender.oauth_access_token,
        refresh_token=sender.oauth_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id="",  # will use env via Request
        client_secret="",
    )

    from app.config import settings
    creds = Credentials(
        token=sender.oauth_access_token,
        refresh_token=sender.oauth_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    )

    if not creds.valid and creds.refresh_token:
        creds.refresh(Request())
        # Persist refreshed token
        sender.oauth_access_token = creds.token
        if creds.expiry:
            sender.oauth_token_expires_at = creds.expiry.isoformat()
        await db.commit()

    service = build("gmail", "v1", credentials=creds)

    mime_msg = email.mime.text.MIMEText(body, "plain", "utf-8")
    mime_msg["To"] = conv.participant_email
    mime_msg["Subject"] = f"Re: {conv.subject}"
    if conv.external_thread_id:
        mime_msg["In-Reply-To"] = conv.external_thread_id
        mime_msg["References"] = conv.external_thread_id

    raw = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode()
    sent = service.users().messages().send(
        userId="me",
        body={"raw": raw, "threadId": conv.external_thread_id},
    ).execute()

    return sent.get("id", "")
