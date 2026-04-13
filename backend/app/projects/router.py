import uuid
from fastapi import APIRouter, Depends, Query, Path, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.projects import service, schemas
from app.shared.exceptions import NotFoundError

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=List[schemas.ProjectListRead])
async def list_projects(
    search: str | None = Query(None),
    sort_by: str = Query("activity"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    projects = await service.list_projects(db, current_user.workspace_id, search, sort_by)
    return [schemas.ProjectListRead.model_validate(p) for p in projects]

@router.post("", response_model=schemas.ProjectRead, status_code=201)
async def create_project(
    payload: schemas.ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.create_project(db, current_user.workspace_id, payload)
    return schemas.ProjectRead.model_validate(project)

@router.get("/{id}", response_model=schemas.ProjectRead)
async def get_project(
    id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.get_project(db, id)
    if not project or project.workspace_id != current_user.workspace_id:
        raise NotFoundError("Project not found")
    return schemas.ProjectRead.model_validate(project)

@router.patch("/{id}", response_model=schemas.ProjectRead)
async def update_project(
    payload: schemas.ProjectUpdate,
    id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.get_project(db, id)
    if not project or project.workspace_id != current_user.workspace_id:
        raise NotFoundError("Project not found")
        
    updated_project = await service.update_project(db, id, payload)
    return schemas.ProjectRead.model_validate(updated_project)

@router.delete("/{id}", status_code=204)
async def delete_project(
    id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.get_project(db, id)
    if not project or project.workspace_id != current_user.workspace_id:
        raise NotFoundError("Project not found")
        
    await service.delete_project(db, id)

@router.post("/{id}/files", response_model=schemas.ProjectFileRead)
async def upload_file(
    id: uuid.UUID = Path(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.get_project(db, id)
    if not project or project.workspace_id != current_user.workspace_id:
        raise NotFoundError("Project not found")
        
    project_file = await service.add_project_file(db, id, file)
    return schemas.ProjectFileRead.model_validate(project_file)

@router.delete("/{id}/files/{file_id}", status_code=204)
async def delete_file(
    id: uuid.UUID = Path(...),
    file_id: uuid.UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    project = await service.get_project(db, id)
    if not project or project.workspace_id != current_user.workspace_id:
        raise NotFoundError("Project not found")
        
    success = await service.remove_project_file(db, file_id)
    if not success:
        raise NotFoundError("File not found")
