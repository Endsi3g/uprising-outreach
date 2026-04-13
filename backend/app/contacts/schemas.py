import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.contacts.models import VerificationStatus


class ContactCreate(BaseModel):
    company_id: uuid.UUID | None = None
    first_name: str = Field(default="", max_length=100)
    last_name: str = Field(default="", max_length=100)
    job_title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None


class ContactUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    job_title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None


class ContactResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    company_id: uuid.UUID | None
    first_name: str
    last_name: str
    job_title: str | None
    email: str | None
    phone: str | None
    linkedin_url: str | None
    verification_status: VerificationStatus
    created_at: datetime

    model_config = {"from_attributes": True}
