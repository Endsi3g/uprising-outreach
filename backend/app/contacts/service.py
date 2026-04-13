import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.contacts.models import Contact
from app.contacts.schemas import ContactCreate, ContactResponse, ContactUpdate
from app.shared.exceptions import raise_not_found
from app.shared.pagination import Page, build_page, decode_cursor


async def list_contacts(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    cursor: str | None,
    limit: int,
    company_id: uuid.UUID | None = None,
) -> Page[ContactResponse]:
    base = select(Contact).where(
        Contact.workspace_id == workspace_id, Contact.deleted_at.is_(None)
    )
    count_base = select(func.count()).select_from(Contact).where(
        Contact.workspace_id == workspace_id, Contact.deleted_at.is_(None)
    )

    if company_id:
        base = base.where(Contact.company_id == company_id)
        count_base = count_base.where(Contact.company_id == company_id)

    query = base.order_by(Contact.created_at.desc(), Contact.id.desc())

    if cursor:
        created_at, cid = decode_cursor(cursor)
        query = query.where(
            (Contact.created_at < created_at)
            | ((Contact.created_at == created_at) & (Contact.id < cid))
        )

    total = (await db.execute(count_base)).scalar_one()
    items = list((await db.execute(query.limit(limit + 1))).scalars().all())
    page = build_page(items, limit, total)
    return Page[ContactResponse](
        data=[ContactResponse.model_validate(c) for c in page["data"]],
        pagination=page["pagination"],
    )


async def create_contact(
    db: AsyncSession, workspace_id: uuid.UUID, payload: ContactCreate
) -> Contact:
    contact = Contact(workspace_id=workspace_id, **payload.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def get_contact(
    db: AsyncSession, workspace_id: uuid.UUID, contact_id: uuid.UUID
) -> Contact:
    result = await db.execute(
        select(Contact).where(
            Contact.id == contact_id,
            Contact.workspace_id == workspace_id,
            Contact.deleted_at.is_(None),
        )
    )
    contact = result.scalar_one_or_none()
    if not contact:
        raise_not_found("Contact", str(contact_id))
    return contact  # type: ignore[return-value]


async def update_contact(
    db: AsyncSession, workspace_id: uuid.UUID, contact_id: uuid.UUID, payload: ContactUpdate
) -> Contact:
    contact = await get_contact(db, workspace_id, contact_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(
    db: AsyncSession, workspace_id: uuid.UUID, contact_id: uuid.UUID
) -> None:
    contact = await get_contact(db, workspace_id, contact_id)
    contact.deleted_at = datetime.now(UTC)
    await db.commit()
