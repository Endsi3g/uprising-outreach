"""Campaigns API router."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.campaigns import service
from app.campaigns.schemas import (
    CampaignCreate,
    CampaignResponse,
    CampaignStats,
    CampaignUpdate,
    LaunchRequest,
    LaunchResponse,
)
from app.database import get_db

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CampaignResponse]:
    return await service.list_campaigns(db, current_user.workspace_id)


@router.post("", response_model=CampaignResponse, status_code=201)
async def create_campaign(
    payload: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    return await service.create_campaign(db, current_user.workspace_id, payload)


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    return await service.get_campaign(db, current_user.workspace_id, campaign_id)


@router.patch("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: uuid.UUID,
    payload: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignResponse:
    return await service.update_campaign(db, current_user.workspace_id, campaign_id, payload)


@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_campaign(db, current_user.workspace_id, campaign_id)


@router.post("/{campaign_id}/launch", response_model=LaunchResponse)
async def launch_campaign(
    campaign_id: uuid.UUID,
    payload: LaunchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LaunchResponse:
    return await service.launch_campaign(
        db, current_user.workspace_id, campaign_id, payload.lead_ids
    )


@router.get("/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CampaignStats:
    return await service.get_campaign_stats(db, current_user.workspace_id, campaign_id)
