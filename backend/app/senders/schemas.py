import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.senders.models import EmailProvider, SenderStatus


class SenderCreate(BaseModel):
    email_address: str
    display_name: str = ""
    provider: EmailProvider = EmailProvider.GMAIL
    daily_send_limit: int = 100


class SenderUpdate(BaseModel):
    display_name: str | None = None
    daily_send_limit: int | None = None
    status: SenderStatus | None = None


class DNSStatusResponse(BaseModel):
    domain: str
    spf_valid: bool
    spf_record: str | None
    spf_error: str | None
    dkim_valid: bool
    dkim_selector: str | None
    dkim_record: str | None
    dkim_error: str | None
    dmarc_valid: bool
    dmarc_policy: str | None
    dmarc_record: str | None
    dmarc_error: str | None
    all_valid: bool


class OAuthAuthorizeResponse(BaseModel):
    authorization_url: str
    provider: EmailProvider


class SenderResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    email_address: str
    display_name: str
    provider: EmailProvider
    status: SenderStatus
    spf_valid: bool | None
    dkim_valid: bool | None
    dmarc_policy: str | None
    dns_verified_at: str | None
    daily_send_limit: int
    warmup_status: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
