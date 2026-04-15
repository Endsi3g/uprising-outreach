import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import Invitation, InvitationStatus, Role
from app.auth.schemas import InvitationCreate


async def create_invitation(
    db: AsyncSession, workspace_id: uuid.UUID, invited_by_id: uuid.UUID, invite: InvitationCreate
) -> Invitation:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    invitation = Invitation(
        workspace_id=workspace_id,
        email=invite.email,
        role=invite.role,
        token=token,
        invited_by_id=invited_by_id,
        expires_at=expires_at,
        status=InvitationStatus.PENDING,
    )
    db.add(invitation)
    await db.flush()
    await db.refresh(invitation)
    return invitation


async def get_invitation_by_token(db: AsyncSession, token: str) -> Invitation | None:
    result = await db.execute(select(Invitation).where(Invitation.token == token))
    return result.scalar_one_or_none()


async def accept_invitation(db: AsyncSession, invitation: Invitation) -> None:
    invitation.status = InvitationStatus.ACCEPTED
    invitation.accepted_at = datetime.now(timezone.utc)
    await db.flush()
