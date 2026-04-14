import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ProjectFileBase(BaseModel):
    filename: str
    file_type: str

class ProjectFileCreate(ProjectFileBase):
    file_path: str

class ProjectFileRead(ProjectFileBase):
    id: uuid.UUID
    project_id: uuid.UUID
    file_path: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    instructions: str | None = None
    memory: str | None = None
    is_favorite: bool = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    instructions: str | None = None
    memory: str | None = None
    is_favorite: bool = None

class ProjectRead(ProjectBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    files: list[ProjectFileRead] = []

    model_config = ConfigDict(from_attributes=True)

class ProjectListRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    is_favorite: bool
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
