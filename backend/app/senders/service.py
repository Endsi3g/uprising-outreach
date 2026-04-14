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
