import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.senders.dns_checker import DNSCheckResult, check_domain
from app.senders.models import SenderAccount, SenderStatus
from app.senders.schemas import SenderCreate, SenderUpdate
from app.shared.exceptions import raise_not_found


async def list_senders(db: AsyncSession, workspace_id: uuid.UUID) -> list[SenderAccount]:
    result = await db.execute(
        select(SenderAccount).where(
            SenderAccount.workspace_id == workspace_id,
            SenderAccount.deleted_at.is_(None),
        )
    )
    return list(result.scalars().all())


async def create_sender(
    db: AsyncSession, workspace_id: uuid.UUID, payload: SenderCreate
) -> SenderAccount:
    sender = SenderAccount(workspace_id=workspace_id, **payload.model_dump())
    db.add(sender)
    await db.commit()
    await db.refresh(sender)
    return sender


async def get_sender(
    db: AsyncSession, workspace_id: uuid.UUID, sender_id: uuid.UUID
) -> SenderAccount:
    result = await db.execute(
        select(SenderAccount).where(
            SenderAccount.id == sender_id,
            SenderAccount.workspace_id == workspace_id,
            SenderAccount.deleted_at.is_(None),
        )
    )
    sender = result.scalar_one_or_none()
    if not sender:
        raise_not_found("SenderAccount", str(sender_id))
    return sender  # type: ignore[return-value]


async def verify_dns(
    db: AsyncSession, workspace_id: uuid.UUID, sender_id: uuid.UUID
) -> DNSCheckResult:
    sender = await get_sender(db, workspace_id, sender_id)

    dns_result = check_domain(sender.email_address)

    # Persist DNS check results
    sender.spf_valid = dns_result.spf_valid
    sender.dkim_valid = dns_result.dkim_valid
    sender.dmarc_policy = dns_result.dmarc_policy
    sender.dns_status = dns_result.to_dict()
    sender.dns_verified_at = datetime.now(UTC).isoformat()

    # Update sender status based on DNS
    if dns_result.all_valid:
        if sender.status == SenderStatus.PENDING:
            sender.status = SenderStatus.ACTIVE
    else:
        sender.status = SenderStatus.ERROR

    await db.commit()
    return dns_result


async def update_sender(
    db: AsyncSession, workspace_id: uuid.UUID, sender_id: uuid.UUID, payload: SenderUpdate
) -> SenderAccount:
    sender = await get_sender(db, workspace_id, sender_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sender, field, value)
    await db.commit()
    await db.refresh(sender)
    return sender


async def delete_sender(
    db: AsyncSession, workspace_id: uuid.UUID, sender_id: uuid.UUID
) -> None:
    sender = await get_sender(db, workspace_id, sender_id)
    sender.deleted_at = datetime.now(UTC)
    await db.commit()


async def register_google_sender(db: AsyncSession, workspace_id: uuid.UUID, credentials) -> SenderAccount:
    """Register or update a Google sender account after OAuth flow."""
    from googleapiclient.discovery import build
    import google.oauth2.credentials
    
    # Get user email using the credentials
    service = build("oauth2", "v2", credentials=credentials)
    user_info = service.userinfo().get().execute()
    email = user_info.get("email")
    name = user_info.get("name", "")
    
    if not email:
        raise ValueError("Google OAuth response did not contain an email address.")
    
    # Check if sender already exists
    result = await db.execute(
        select(SenderAccount).where(
            SenderAccount.workspace_id == workspace_id,
            SenderAccount.email_address == email,
            SenderAccount.deleted_at.is_(None)
        )
    )
    sender = result.scalar_one_or_none()
    
    if not sender:
        sender = SenderAccount(
            workspace_id=workspace_id,
            email_address=email,
            display_name=name,
            provider="gmail",
            status=SenderStatus.ACTIVE
        )
        db.add(sender)
    
    # Update tokens
    sender.oauth_access_token = credentials.token
    sender.oauth_refresh_token = credentials.refresh_token or sender.oauth_refresh_token
    sender.oauth_token_expires_at = credentials.expiry.isoformat() if credentials.expiry else None
    sender.oauth_scopes = ",".join(credentials.scopes)
    sender.status = SenderStatus.ACTIVE
    
    await db.refresh(sender)
    return sender


async def send_gmail(
    sender_account: SenderAccount,
    to_email: str,
    subject: str,
    content: str,
) -> str:
    """Send an email using Gmail API with the sender's OAuth tokens."""
    import base64
    from email.mime.text import MIMEText
    from googleapiclient.discovery import build
    from google.oauth2.credentials import Credentials
    from app.config import settings

    # Prepare credentials object
    creds = Credentials(
        token=sender_account.oauth_access_token,
        refresh_token=sender_account.oauth_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
    )

    # Build service
    service = build("gmail", "v1", credentials=creds)

    # Create message
    message = MIMEText(content)
    message["to"] = to_email
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    # Send
    sent_message = service.users().messages().send(userId="me", body={"raw": raw}).execute()
    return sent_message["id"]
