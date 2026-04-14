"""Gmail inbox sync background task."""

from __future__ import annotations

import base64
import email as email_lib
import email.header
import logging
import uuid
from datetime import UTC, datetime

logger = logging.getLogger(__name__)


def _decode_header(value: str) -> str:
    parts = email.header.decode_header(value)
    decoded = []
    for chunk, charset in parts:
        if isinstance(chunk, bytes):
            decoded.append(chunk.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(chunk)
    return " ".join(decoded)


def _extract_text(payload: dict) -> str:
    """Recursively extract plain text from a Gmail message payload."""
    mime_type = payload.get("mimeType", "")
    body = payload.get("body", {})
    data = body.get("data", "")

    if mime_type == "text/plain" and data:
        return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")

    if mime_type.startswith("multipart/"):
        for part in payload.get("parts", []):
            text = _extract_text(part)
            if text:
                return text

    return ""


async def sync_gmail_inbox(ctx: dict, sender_account_id: str) -> dict:
    """
    Sync the Gmail inbox for a given SenderAccount.

    - Lists recent threads (max 50)
    - For each thread: fetches messages, upserts InboxConversation + InboxMessages
    - Classifies new inbound messages with Claude Haiku
    - Returns a summary dict
    """
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from sqlalchemy import select

    from app.ai.service import classify_inbox_message
    from app.config import settings
    from app.database import AsyncSessionLocal
    from app.inbox.models import InboxConversation, InboxMessage
    from app.senders.models import SenderAccount

    synced_threads = 0
    new_messages = 0
    errors = 0

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(SenderAccount).where(SenderAccount.id == uuid.UUID(sender_account_id))
        )
        sender = result.scalar_one_or_none()
        if not sender or not sender.oauth_access_token:
            logger.error("sync_gmail_inbox: sender %s not found or no token", sender_account_id)
            return {"error": "sender_not_found"}

        creds = Credentials(
            token=sender.oauth_access_token,
            refresh_token=sender.oauth_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
        )

        if not creds.valid and creds.refresh_token:
            try:
                creds.refresh(Request())
                sender.oauth_access_token = creds.token
                if creds.expiry:
                    sender.oauth_token_expires_at = creds.expiry.isoformat()
                await db.commit()
            except Exception as exc:
                logger.error("Token refresh failed for sender %s: %s", sender_account_id, exc)
                return {"error": "token_refresh_failed"}

        service = build("gmail", "v1", credentials=creds)
        workspace_id = sender.workspace_id

        try:
            threads_result = service.users().threads().list(
                userId="me",
                labelIds=["INBOX"],
                maxResults=50,
            ).execute()
        except Exception as exc:
            logger.error("Gmail threads.list failed: %s", exc)
            return {"error": str(exc)}

        thread_items = threads_result.get("threads", [])

        for thread_item in thread_items:
            thread_id = thread_item["id"]
            try:
                # Check if this thread already exists
                existing = await db.execute(
                    select(InboxConversation).where(
                        InboxConversation.workspace_id == workspace_id,
                        InboxConversation.external_thread_id == thread_id,
                    )
                )
                conv = existing.scalar_one_or_none()

                # Fetch full thread
                thread_data = service.users().threads().get(
                    userId="me", id=thread_id, format="full"
                ).execute()
                messages = thread_data.get("messages", [])

                if not messages:
                    continue

                # Parse first message for subject + participant
                first_msg = messages[0]
                headers = {
                    h["name"].lower(): h["value"]
                    for h in first_msg.get("payload", {}).get("headers", [])
                }
                subject = _decode_header(headers.get("subject", "(sans objet)"))
                from_header = headers.get("from", "")
                # Parse "Name <email>" format
                participant_name = ""
                participant_email = from_header
                if "<" in from_header and ">" in from_header:
                    participant_name = from_header.split("<")[0].strip().strip('"')
                    participant_email = from_header.split("<")[1].rstrip(">").strip()

                # Create or get conversation
                if conv is None:
                    conv = InboxConversation(
                        workspace_id=workspace_id,
                        sender_account_id=sender.id,
                        channel="gmail",
                        external_thread_id=thread_id,
                        subject=subject,
                        participant_name=participant_name,
                        participant_email=participant_email,
                    )
                    db.add(conv)
                    await db.flush()
                    synced_threads += 1

                # Process messages
                for gmail_msg in messages:
                    msg_id = gmail_msg["id"]

                    # Skip if already stored
                    dup = await db.execute(
                        select(InboxMessage).where(InboxMessage.external_message_id == msg_id)
                    )
                    if dup.scalar_one_or_none():
                        continue

                    msg_headers = {
                        h["name"].lower(): h["value"]
                        for h in gmail_msg.get("payload", {}).get("headers", [])
                    }
                    msg_from = msg_headers.get("from", "")
                    msg_sender_email = msg_from.split("<")[-1].rstrip(">") if "<" in msg_from else msg_from
                    msg_sender_name = msg_from.split("<")[0].strip().strip('"') if "<" in msg_from else ""

                    # Determine direction: outbound if from our sender account
                    direction = (
                        "outbound"
                        if sender.email_address.lower() in msg_sender_email.lower()
                        else "inbound"
                    )

                    body_text = _extract_text(gmail_msg.get("payload", {}))

                    # Parse date
                    internal_date = gmail_msg.get("internalDate")
                    sent_at = None
                    if internal_date:
                        try:
                            sent_at = datetime.fromtimestamp(int(internal_date) / 1000, tz=UTC)
                        except (ValueError, OSError):
                            pass

                    msg = InboxMessage(
                        conversation_id=conv.id,
                        direction=direction,
                        sender_name=msg_sender_name,
                        sender_email=msg_sender_email,
                        body_text=body_text,
                        external_message_id=msg_id,
                        sent_at=sent_at,
                    )
                    db.add(msg)
                    new_messages += 1

                    # Classify the latest inbound message
                    if direction == "inbound" and body_text:
                        classification = await classify_inbox_message(body_text)
                        conv.classification = classification

                    # Update last_message_at
                    if sent_at and (conv.last_message_at is None or sent_at > conv.last_message_at):
                        conv.last_message_at = sent_at  # type: ignore[assignment]

            except Exception as exc:
                logger.error("Error processing thread %s: %s", thread_id, exc)
                errors += 1
                continue

        await db.commit()

    logger.info(
        "sync_gmail_inbox(%s): %d threads, %d new messages, %d errors",
        sender_account_id, synced_threads, new_messages, errors,
    )
    return {
        "synced_threads": synced_threads,
        "new_messages": new_messages,
        "errors": errors,
    }
