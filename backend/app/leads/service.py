import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.leads.models import Lead, LeadStatus, SuppressionEntry
from app.leads.schemas import (
    BulkActionRequest,
    BulkActionResponse,
    LeadCreate,
    LeadFilter,
    LeadResponse,
    LeadUpdate,
)
from app.shared.exceptions import BusinessRuleError, NotFoundError, raise_not_found
from app.shared.pagination import Page, build_page, decode_cursor


async def list_leads(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    filters: LeadFilter,
    cursor: str | None,
    limit: int,
) -> Page[LeadResponse]:
    base_where = [
        Lead.workspace_id == workspace_id,
        Lead.deleted_at.is_(None),
    ]

    if filters.status:
        base_where.append(Lead.status.in_(filters.status))
    if filters.owner_id:
        base_where.append(Lead.owner_id == filters.owner_id)
    if filters.score_min is not None:
        base_where.append(Lead.score >= filters.score_min)
    if filters.score_max is not None:
        base_where.append(Lead.score <= filters.score_max)
    if filters.source:
        base_where.append(Lead.source == filters.source)

    query = select(Lead).where(*base_where).order_by(Lead.created_at.desc(), Lead.id.desc())

    if cursor:
        created_at, cid = decode_cursor(cursor)
        query = query.where(
            (Lead.created_at < created_at)
            | ((Lead.created_at == created_at) & (Lead.id < cid))
        )

    count_result = await db.execute(
        select(func.count()).select_from(Lead).where(*base_where)
    )
    total = count_result.scalar_one()

    result = await db.execute(query.limit(limit + 1))
    items = list(result.scalars().all())

    page = build_page(items, limit, total)
    return Page[LeadResponse](
        data=[LeadResponse.model_validate(l) for l in page["data"]],
        pagination=page["pagination"],
    )


async def create_lead(
    db: AsyncSession, workspace_id: uuid.UUID, payload: LeadCreate
) -> Lead:
    lead = Lead(workspace_id=workspace_id, **payload.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


async def get_lead(
    db: AsyncSession, workspace_id: uuid.UUID, lead_id: uuid.UUID
) -> Lead:
    result = await db.execute(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.workspace_id == workspace_id,
            Lead.deleted_at.is_(None),
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise_not_found("Lead", str(lead_id))
    return lead  # type: ignore[return-value]


async def update_lead(
    db: AsyncSession, workspace_id: uuid.UUID, lead_id: uuid.UUID, payload: LeadUpdate
) -> Lead:
    lead = await get_lead(db, workspace_id, lead_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.commit()
    await db.refresh(lead)
    return lead


async def delete_lead(
    db: AsyncSession, workspace_id: uuid.UUID, lead_id: uuid.UUID
) -> None:
    lead = await get_lead(db, workspace_id, lead_id)
    lead.deleted_at = datetime.now(UTC)
    await db.commit()


async def bulk_action(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    payload: BulkActionRequest,
    redis=None,
) -> BulkActionResponse:
    action = payload.action
    lead_ids = payload.lead_ids
    params = payload.params or {}

    processed = 0
    skipped = 0
    job_id = None

    if action == "delete":
        now = datetime.now(UTC)
        result = await db.execute(
            select(Lead).where(
                Lead.id.in_(lead_ids),
                Lead.workspace_id == workspace_id,
                Lead.deleted_at.is_(None),
            )
        )
        leads = result.scalars().all()
        for lead in leads:
            lead.deleted_at = now
            processed += 1
        skipped = len(lead_ids) - processed
        await db.commit()

    elif action == "assign":
        owner_id = params.get("owner_id")
        if not owner_id:
            raise BusinessRuleError("assign action requires params.owner_id")
        result = await db.execute(
            select(Lead).where(
                Lead.id.in_(lead_ids),
                Lead.workspace_id == workspace_id,
                Lead.deleted_at.is_(None),
            )
        )
        leads = result.scalars().all()
        for lead in leads:
            lead.owner_id = uuid.UUID(owner_id)
            processed += 1
        skipped = len(lead_ids) - processed
        await db.commit()

    elif action == "suppress":
        result = await db.execute(
            select(Lead).where(
                Lead.id.in_(lead_ids),
                Lead.workspace_id == workspace_id,
                Lead.deleted_at.is_(None),
            )
        )
        leads = result.scalars().all()
        for lead in leads:
            lead.status = LeadStatus.SUPPRESSED
            processed += 1
        skipped = len(lead_ids) - processed
        await db.commit()

    elif action == "enrich":
        # Enqueue enrichment jobs — actual enrichment happens in Phase 2
        job_id = str(uuid.uuid4())
        if redis:
            for lid in lead_ids:
                await redis.enqueue_job(
                    "enrich_lead_task",
                    str(lid),
                    str(workspace_id),
                    _queue_name="outreach:default",
                )
                processed += 1
        else:
            processed = len(lead_ids)

    else:
        raise BusinessRuleError(f"Unknown bulk action: '{action}'")

    return BulkActionResponse(
        action=action,
        processed=processed,
        skipped=skipped,
        job_id=job_id,
    )
