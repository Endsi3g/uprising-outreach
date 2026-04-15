import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.campaigns.models import Campaign, CampaignStep
from app.campaigns.schemas import CampaignCreate, CampaignUpdate

async def list_campaigns(db: AsyncSession, workspace_id: uuid.UUID) -> list[Campaign]:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.steps))
        .where(Campaign.workspace_id == workspace_id, Campaign.deleted_at.is_(None))
        .order_by(Campaign.created_at.desc())
    )
    return list(result.scalars().all())

async def create_campaign(db: AsyncSession, workspace_id: uuid.UUID, payload: CampaignCreate) -> Campaign:
    campaign = Campaign(
        workspace_id=workspace_id,
        name=payload.name,
        description=payload.description
    )
    db.add(campaign)
    await db.flush()
    
    # Add steps
    for i, step_data in enumerate(payload.steps):
        step = CampaignStep(
            workspace_id=workspace_id,
            campaign_id=campaign.id,
            order=step_data.order or (i + 1),
            **step_data.model_dump(exclude={"order"})
        )
        db.add(step)
    
    await db.commit()
    await db.refresh(campaign)
    
    # Reload with steps
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.steps))
        .where(Campaign.id == campaign.id)
    )
    return result.scalar_one()

async def get_campaign(db: AsyncSession, workspace_id: uuid.UUID, campaign_id: uuid.UUID) -> Campaign:
    result = await db.execute(
        select(Campaign)
        .options(selectinload(Campaign.steps))
        .where(
            Campaign.id == campaign_id,
            Campaign.workspace_id == workspace_id,
            Campaign.deleted_at.is_(None)
        )
    )
    campaign = result.scalar_one_or_none()
    if not campaign:
        from app.shared.exceptions import raise_not_found
        raise_not_found("Campaign", str(campaign_id))
    return campaign
