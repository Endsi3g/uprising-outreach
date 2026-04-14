import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    domain: str | None = None
    sector: str | None = None
    city: str | None = None
    country: str | None = None
    estimated_size: str | None = None
    website: str | None = None
    linkedin_url: str | None = None
    source: str | None = None
    description: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    domain: str | None = None
    sector: str | None = None
    city: str | None = None
    country: str | None = None
    estimated_size: str | None = None
    website: str | None = None
    linkedin_url: str | None = None
    description: str | None = None


class CompanyResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    domain: str | None
    sector: str | None
    city: str | None
    country: str | None
    estimated_size: str | None
    website: str | None
    linkedin_url: str | None
    source: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
