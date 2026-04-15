import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.campaigns.models import CampaignStatus, CampaignStepType

class CampaignStepCreate(BaseModel):
    order: int = Field(default=1)
    step_type: CampaignStepType = Field(default=CampaignStepType.EMAIL)
    subject: str | None = None
    template: str | None = None
    wait_days: int | None = None

class CampaignStepResponse(BaseModel):
    id: uuid.UUID
    order: int
    step_type: CampaignStepType
    subject: str | None
    template: str | None
    wait_days: int | None
    
    model_config = {"from_attributes": True}

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    steps: list[CampaignStepCreate] = []

class CampaignUpdate(BaseModel):
    name: str | None = None
    status: CampaignStatus | None = None
    description: str | None = None

class CampaignResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    status: CampaignStatus
    description: str | None
    created_at: datetime
    steps: list[CampaignStepResponse] = []
    
    model_config = {"from_attributes": True}
