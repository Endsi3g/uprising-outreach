import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.leads.models import LeadStatus, LeadTemperature


class LeadCreate(BaseModel):
    company_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    source: str | None = None
    notes: str | None = None
    extra: dict[str, Any] | None = None


class LeadUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    status: LeadStatus | None = None
    temperature: LeadTemperature | None = None
    score: int | None = None
    notes: str | None = None
    next_action: str | None = None


class LeadResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    company_id: uuid.UUID | None
    contact_id: uuid.UUID | None
    owner_id: uuid.UUID | None
    status: LeadStatus
    temperature: LeadTemperature
    score: int | None
    source: str | None
    notes: str | None
    enrichment_status: str | None
    next_action: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BulkActionRequest(BaseModel):
    action: str = Field(..., description="tag|suppress|add_to_segment|enrich|delete|assign")
    lead_ids: list[uuid.UUID] = Field(..., min_length=1, max_length=500)
    params: dict[str, Any] | None = None


class BulkActionResponse(BaseModel):
    action: str
    processed: int
    skipped: int
    job_id: str | None = None


class CSVImportResponse(BaseModel):
    job_id: str
    message: str


class LeadFilter(BaseModel):
    status: list[LeadStatus] | None = None
    owner_id: uuid.UUID | None = None
    score_min: int | None = None
    score_max: int | None = None
    source: str | None = None
    search: str | None = None
