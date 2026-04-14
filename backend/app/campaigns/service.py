"""Campaign service — CRUD, step management, launch logic."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.campaigns.models import (
    Campaign,
    CampaignLead,
    CampaignLeadStatus,
    CampaignStatus,
    CampaignStep,
    CampaignStepType,
    ScheduledSend,
    ScheduledSendStatus,
)
from app.campaigns.schemas import (
    CampaignCreate,
    CampaignResponse,
    CampaignStats,
    CampaignUpdate,
    LaunchResponse,
    StepResponse,
)
from app.shared.exceptions import NotFoundError, raise_not_found


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get(db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID) -> Campaign:
    result = await db.execute(
        select(Campaign).where(
            Campaign.id == campaign_id,
            Campaign.workspace_id == workspace_id,
            Campaign.deleted_at.is_(None),
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        raise_not_found("Campaign", str(campaign_id))
    return campaign  # type: ignore[return-value]


async def _load_steps(db: AsyncSession, campaign_id: uuid.UUID) -> list[CampaignStep]:
    result = await db.execute(
        select(CampaignStep)
        .where(CampaignStep.campaign_id == campaign_id)
        .order_by(CampaignStep.position)
    )
    return list(result.scalars().all())


def _to_response(campaign: Campaign, steps: list[CampaignStep]) -> CampaignResponse:
    return CampaignResponse(
        **{c.key: getattr(campaign, c.key) for c in Campaign.__table__.columns},
        steps=[StepResponse.model_validate(s) for s in steps],
    )


# ── CRUD ───────────────────────────────────────────────────────────────────────

async def list_campaigns(db: AsyncSession, workspace_id: uuid.UUID) -> list[CampaignResponse]:
    result = await db.execute(
        select(Campaign)
        .where(Campaign.workspace_id == workspace_id, Campaign.deleted_at.is_(None))
        .order_by(Campaign.created_at.desc())
    )
    campaigns = list(result.scalars().all())
    out = []
    for c in campaigns:
        steps = await _load_steps(db, c.id)
        out.append(_to_response(c, steps))
    return out


async def create_campaign(
    db: AsyncSession, workspace_id: uuid.UUID, payload: CampaignCreate
) -> CampaignResponse:
    campaign = Campaign(
        workspace_id=workspace_id,
        name=payload.name,
        description=payload.description,
        sender_account_id=payload.sender_account_id,
    )
    db.add(campaign)
    await db.flush()

    steps: list[CampaignStep] = []
    for s in payload.steps:
        step = CampaignStep(campaign_id=campaign.id, **s.model_dump())
        db.add(step)
        steps.append(step)

    await db.commit()
    await db.refresh(campaign)
    return _to_response(campaign, steps)


async def get_campaign(
    db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID
) -> CampaignResponse:
    campaign = await _get(db, workspace_id, campaign_id)
    steps = await _load_steps(db, campaign_id)
    return _to_response(campaign, steps)


async def update_campaign(
    db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID, payload: CampaignUpdate
) -> CampaignResponse:
    campaign = await _get(db, workspace_id, campaign_id)

    for field, value in payload.model_dump(exclude_unset=True, exclude={"steps"}).items():
        setattr(campaign, field, value)

    if payload.steps is not None:
        # Replace all steps
        existing = await _load_steps(db, campaign_id)
        for step in existing:
            await db.delete(step)
        await db.flush()
        new_steps: list[CampaignStep] = []
        for s in payload.steps:
            step = CampaignStep(campaign_id=campaign.id, **s.model_dump())
            db.add(step)
            new_steps.append(step)
        await db.commit()
        await db.refresh(campaign)
        return _to_response(campaign, new_steps)

    await db.commit()
    await db.refresh(campaign)
    steps = await _load_steps(db, campaign_id)
    return _to_response(campaign, steps)


async def delete_campaign(
    db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID
) -> None:
    campaign = await _get(db, workspace_id, campaign_id)
    campaign.deleted_at = datetime.now(UTC)
    await db.commit()


# ── Launch ─────────────────────────────────────────────────────────────────────

async def launch_campaign(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    campaign_id: uuid.UUID,
    lead_ids: list[uuid.UUID],
) -> LaunchResponse:
    from arq import create_pool
    from arq.connections import RedisSettings
    from app.config import settings
    from app.leads.models import Lead, LeadStatus

    campaign = await _get(db, workspace_id, campaign_id)
    steps = await _load_steps(db, campaign_id)

    email_steps = [s for s in steps if s.step_type == CampaignStepType.EMAIL]
    if not email_steps:
        from app.shared.exceptions import BusinessRuleError
        raise BusinessRuleError("Campaign must have at least one email step before launching.")

    # If no specific leads provided, enroll all eligible leads
    if not lead_ids:
        result = await db.execute(
            select(Lead.id).where(
                Lead.workspace_id == workspace_id,
                Lead.deleted_at.is_(None),
                Lead.status.in_([LeadStatus.RAW, LeadStatus.ENRICHED, LeadStatus.SCORED]),
            )
        )
        lead_ids = [row[0] for row in result.all()]

    if not lead_ids:
        from app.shared.exceptions import BusinessRuleError
        raise BusinessRuleError("No eligible leads found to enroll.")

    now = datetime.now(UTC)
    enrolled = 0

    # Find the first step (position 0)
    first_step = min(steps, key=lambda s: s.position)

    redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))

    for lead_id in lead_ids:
        # Skip if already enrolled
        existing = await db.execute(
            select(CampaignLead).where(
                CampaignLead.campaign_id == campaign_id,
                CampaignLead.lead_id == lead_id,
            )
        )
        if existing.scalar_one_or_none():
            continue

        campaign_lead = CampaignLead(
            campaign_id=campaign_id,
            lead_id=lead_id,
            workspace_id=workspace_id,
            status=CampaignLeadStatus.ENROLLED,
            current_step=first_step.position,
            enrolled_at=now,
        )
        db.add(campaign_lead)
        await db.flush()

        # Schedule the first step
        delay = timedelta(days=first_step.delay_days, hours=first_step.delay_hours)
        scheduled_at = now + delay

        send = ScheduledSend(
            campaign_id=campaign_id,
            campaign_lead_id=campaign_lead.id,
            step_id=first_step.id,
            lead_id=lead_id,
            workspace_id=workspace_id,
            sender_account_id=campaign.sender_account_id,
            scheduled_at=scheduled_at,
        )
        db.add(send)
        await db.flush()

        # Enqueue the ARQ task
        defer_secs = max(0, int(delay.total_seconds()))
        await redis.enqueue_job(
            "execute_campaign_step",
            str(send.id),
            _defer_by=timedelta(seconds=defer_secs) if defer_secs else None,
            _queue_name="outreach:default",
        )
        enrolled += 1

    # Update campaign
    campaign.status = CampaignStatus.ACTIVE
    campaign.leads_count = campaign.leads_count + enrolled

    # Mark leads as in_sequence
    from app.leads.models import Lead as LeadModel
    for lead_id in lead_ids[:enrolled]:
        result = await db.execute(
            select(LeadModel).where(LeadModel.id == lead_id, LeadModel.workspace_id == workspace_id)
        )
        lead = result.scalar_one_or_none()
        if lead:
            lead.status = LeadStatus.IN_SEQUENCE

    await db.commit()
    await redis.aclose()

    return LaunchResponse(
        campaign_id=campaign_id,
        enrolled=enrolled,
        message=f"{enrolled} lead(s) enrolled and queued for sending.",
    )


# ── Stats ──────────────────────────────────────────────────────────────────────

async def get_campaign_stats(
    db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID
) -> CampaignStats:
    campaign = await _get(db, workspace_id, campaign_id)

    pending_count_result = await db.execute(
        select(func.count()).select_from(ScheduledSend).where(
            ScheduledSend.campaign_id == campaign_id,
            ScheduledSend.status == ScheduledSendStatus.PENDING,
        )
    )
    pending = pending_count_result.scalar_one()

    sent = campaign.sent_count
    reply_rate = round(campaign.reply_count / sent * 100, 1) if sent > 0 else 0.0
    open_rate = round(campaign.open_count / sent * 100, 1) if sent > 0 else 0.0

    return CampaignStats(
        campaign_id=campaign_id,
        leads_count=campaign.leads_count,
        sent_count=sent,
        reply_count=campaign.reply_count,
        open_count=campaign.open_count,
        pending_sends=pending,
        reply_rate=reply_rate,
        open_rate=open_rate,
    )
