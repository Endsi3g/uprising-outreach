"""Facebook webhook event handlers.

Called by the webhook router after signature verification. Each handler
receives a parsed event dict and a db session, and is responsible for
persisting the event to the relevant domain models.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.inbox.models import InboxConversation, InboxMessage
from app.senders.models import EmailProvider, SenderAccount


# ---------------------------------------------------------------------------
# Messaging events (Messenger)
# ---------------------------------------------------------------------------


async def handle_messaging_event(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    page_id: str,
    messaging: dict,
) -> None:
    """Persist an incoming Messenger message as an InboxConversation + InboxMessage.

    ``messaging`` is one element from entry.messaging[].
    """
    sender_psid: str = messaging.get("sender", {}).get("id", "")
    message: dict = messaging.get("message", {})
    message_id: str | None = message.get("mid")
    text: str = message.get("text", "")
    timestamp_ms: int = messaging.get("timestamp", 0)
    sent_at = datetime.fromtimestamp(timestamp_ms / 1000, tz=UTC) if timestamp_ms else datetime.now(UTC)

    # Resolve the SenderAccount for this page
    sender_account_id = await _resolve_sender_account(db, workspace_id, page_id)

    # Find or create a conversation keyed on (workspace, page_id, sender_psid)
    thread_id = f"{page_id}:{sender_psid}"
    result = await db.execute(
        select(InboxConversation).where(
            InboxConversation.workspace_id == workspace_id,
            InboxConversation.external_thread_id == thread_id,
        )
    )
    conversation = result.scalar_one_or_none()

    if conversation is None:
        conversation = InboxConversation(
            workspace_id=workspace_id,
            sender_account_id=sender_account_id,
            channel="messenger",
            external_thread_id=thread_id,
            subject="Messenger",
            participant_name=sender_psid,
            participant_email=sender_psid,
            status="open",
        )
        db.add(conversation)
        await db.flush()  # get conversation.id without committing

    # Deduplicate by external_message_id
    if message_id:
        existing = await db.execute(
            select(InboxMessage).where(InboxMessage.external_message_id == message_id)
        )
        if existing.scalar_one_or_none() is not None:
            return  # already stored

    msg = InboxMessage(
        conversation_id=conversation.id,
        direction="inbound",
        sender_name=sender_psid,
        sender_email=sender_psid,
        body_text=text,
        external_message_id=message_id,
        sent_at=sent_at,
    )
    db.add(msg)
    conversation.last_message_at = sent_at
    await db.commit()


# ---------------------------------------------------------------------------
# Lead Ads events (leadgen)
# ---------------------------------------------------------------------------


async def handle_leadgen_event(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    page_id: str,
    leadgen_value: dict,
) -> None:
    """Create or update a Lead from a Facebook Lead Ad submission.

    ``leadgen_value`` is the ``changes[].value`` dict from the webhook payload:
    { "leadgen_id": "...", "page_id": "...", "form_id": "...", ... }

    Note: full field data requires a separate Graph API call using the
    leadgen_id.  We enqueue an ARQ task to do that asynchronously.
    """
    from arq import create_pool
    from arq.connections import RedisSettings
    from app.config import settings

    # Enqueue by function name string to avoid circular imports with facebook_tasks
    pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    await pool.enqueue_job(
        "import_facebook_lead",
        str(workspace_id),
        page_id,
        leadgen_value.get("leadgen_id", ""),
        leadgen_value.get("form_id", ""),
    )
    await pool.aclose()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _resolve_sender_account(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    page_id: str,
) -> uuid.UUID | None:
    result = await db.execute(
        select(SenderAccount.id).where(
            SenderAccount.workspace_id == workspace_id,
            SenderAccount.provider == EmailProvider.FACEBOOK,
            SenderAccount.email_address == page_id,
            SenderAccount.deleted_at.is_(None),
        )
    )
    row = result.scalar_one_or_none()
    return row
