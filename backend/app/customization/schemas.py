from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class SkillBase(BaseModel):
    name: str
    description: str
    content: str
    trigger: str
    is_active: bool = True

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    trigger: Optional[str] = None
    is_active: Optional[bool] = None

class SkillRead(SkillBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    workspace_id: UUID
    author: str
    created_at: datetime
    updated_at: datetime

class ConnectorBase(BaseModel):
    name: str
    provider: str
    status: str
    icon: Optional[str] = None
    permissions: dict

class ConnectorRead(ConnectorBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    workspace_id: UUID
    created_at: datetime
    updated_at: datetime
