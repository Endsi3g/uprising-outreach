"""Campaign Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.campaigns.models import CampaignLeadStatus, CampaignStatus, CampaignStepType, ScheduledSendStatus


# ── Step schemas ──────────────────────────────────────────────────────────────

class StepBase(BaseModel):
    position: int
    step_type: CampaignStepType
    subject: str | None = None
    body_html: str | None = None
    body_text: str | None = None
    delay_days: int = 0
    delay_hours: int = 0


class StepCreate(StepBase):
    pass


class StepResponse(StepBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    created_at: datetime


# ── Campaign schemas ──────────────────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    sender_account_id: uuid.UUID | None = None
    steps: list[StepCreate] = []


class CampaignUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    sender_account_id: uuid.UUID | None = None
    status: CampaignStatus | None = None
    steps: list[StepCreate] | None = None


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    description: str | None
    status: CampaignStatus
    sender_account_id: uuid.UUID | None
    leads_count: int
    sent_count: int
    reply_count: int
    open_count: int
    created_at: datetime
    updated_at: datetime
    steps: list[StepResponse] = []


# ── Launch schemas ─────────────────────────────────────────────────────────────

class LaunchRequest(BaseModel):
    lead_ids: list[uuid.UUID] = Field(default=[], description="Specific leads to enroll. Empty = all RAW/ENRICHED/SCORED leads.")


class LaunchResponse(BaseModel):
    campaign_id: uuid.UUID
    enrolled: int
    message: str


# ── Stats schema ──────────────────────────────────────────────────────────────

class CampaignStats(BaseModel):
    campaign_id: uuid.UUID
    leads_count: int
    sent_count: int
    reply_count: int
    open_count: int
    pending_sends: int
    reply_rate: float
    open_rate: float
