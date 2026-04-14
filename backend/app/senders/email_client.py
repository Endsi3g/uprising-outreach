"""Email send client — Gmail and Outlook.

Each function accepts a SenderAccount (already loaded from DB) and the
message fields, sends via the provider's API, and returns the provider's
message ID.  Token refresh is handled in-place and the updated token is
persisted back to the SenderAccount row.
"""

from __future__ import annotations

import base64
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)


async def send_gmail(
    db,
    sender,  # SenderAccount
    to_email: str,
    subject: str,
    body_html: str,
    body_text: str | None = None,
    reply_to_message_id: str | None = None,
) -> str:
    """Send an email via Gmail API.

    Returns the Gmail message ID.
    Refreshes the OAuth token if expired and persists the new token.
    """
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

    from app.config import settings

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
            logger.error("Gmail token refresh failed for %s: %s", sender.email_address, exc)
            raise RuntimeError(f"Token refresh failed: {exc}") from exc

    service = build("gmail", "v1", credentials=creds)

    # Build the MIME message
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{sender.display_name} <{sender.email_address}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    if body_text:
        msg.attach(MIMEText(body_text, "plain", "utf-8"))
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    if reply_to_message_id:
        msg["In-Reply-To"] = reply_to_message_id
        msg["References"] = reply_to_message_id

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

    try:
        result = service.users().messages().send(
            userId="me",
            body={"raw": raw},
        ).execute()
        message_id: str = result["id"]
        logger.info("Gmail sent to %s — message_id=%s", to_email, message_id)
        return message_id
    except HttpError as exc:
        logger.error("Gmail send failed to %s: %s", to_email, exc)
        raise RuntimeError(f"Gmail send error: {exc}") from exc


async def send_outlook(
    db,
    sender,  # SenderAccount
    to_email: str,
    subject: str,
    body_html: str,
    body_text: str | None = None,
) -> str:
    """Send an email via Microsoft Graph API (Outlook).

    Returns a synthetic message ID from the API response.
    """
    import httpx

    access_token = sender.oauth_access_token

    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body_html,
            },
            "toRecipients": [
                {"emailAddress": {"address": to_email}},
            ],
            "from": {
                "emailAddress": {
                    "address": sender.email_address,
                    "name": sender.display_name,
                }
            },
        },
        "saveToSentItems": "true",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://graph.microsoft.com/v1.0/me/sendMail",
            json=payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

    if resp.status_code == 202:
        logger.info("Outlook sent to %s", to_email)
        return f"outlook:{sender.email_address}:{to_email}"

    logger.error("Outlook send failed to %s: %s %s", to_email, resp.status_code, resp.text)
    raise RuntimeError(f"Outlook send error {resp.status_code}: {resp.text}")


async def send_email(
    db,
    sender,  # SenderAccount
    to_email: str,
    subject: str,
    body_html: str,
    body_text: str | None = None,
) -> str:
    """Route to the correct provider based on sender.provider."""
    from app.senders.models import EmailProvider

    if sender.provider == EmailProvider.GMAIL:
        return await send_gmail(db, sender, to_email, subject, body_html, body_text)
    elif sender.provider == EmailProvider.OUTLOOK:
        return await send_outlook(db, sender, to_email, subject, body_html, body_text)
    else:
        raise ValueError(f"Unsupported email provider for sending: {sender.provider}")
