import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.dependencies import get_current_user, require_role
from app.auth.models import Role, User
from app.database import get_db
from app.campaigns import service
from app.campaigns.schemas import CampaignCreate, CampaignResponse, CampaignUpdate

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    campaigns = await service.list_campaigns(db, current_user.workspace_id)
    return [CampaignResponse.model_validate(c) for c in campaigns]

@router.post("", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    payload: CampaignCreate,
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER)),
    db: AsyncSession = Depends(get_db)
):
    campaign = await service.create_campaign(db, current_user.workspace_id, payload)
    return CampaignResponse.model_validate(campaign)

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    campaign = await service.get_campaign(db, current_user.workspace_id, campaign_id)
    return CampaignResponse.model_validate(campaign)
