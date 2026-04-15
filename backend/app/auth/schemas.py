import uuid

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from app.auth.models import Role, InvitationStatus


class RegisterRequest(BaseModel):
    workspace_name: str = Field(..., min_length=1, max_length=255)
    workspace_slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role: Role
    is_active: bool

    model_config = {"from_attributes": True}


class InvitationCreate(BaseModel):
    email: EmailStr
    role: Role = Role.SDR


class InvitationResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: Role
    token: str
    status: InvitationStatus
    expires_at: datetime
    invited_by_id: uuid.UUID

    model_config = {"from_attributes": True}
