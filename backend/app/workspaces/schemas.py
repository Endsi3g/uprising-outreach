import uuid

from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    timezone: str = "UTC"
    language: str = "en"
    currency: str = "EUR"


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    timezone: str
    language: str
    currency: str

    model_config = {"from_attributes": True}
