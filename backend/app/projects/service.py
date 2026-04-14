import uuid
from datetime import datetime
from sqlalchemy import select, update, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.projects.models import Project, ProjectFile
from app.projects.schemas import ProjectCreate, ProjectUpdate, ProjectFileCreate

async def list_projects(
    db: AsyncSession, 
    workspace_id: uuid.UUID, 
    search: str | None = None,
    sort_by: str = "activity"
) -> list[Project]:
    query = select(Project).where(Project.workspace_id == workspace_id)
    
    if search:
        query = query.where(Project.name.ilike(f"%{search}%"))
        
    if sort_by == "activity":
        query = query.order_by(desc(Project.updated_at))
    elif sort_by == "name":
        query = query.order_by(Project.name)
        
    result = await db.execute(query)
    return list(result.scalars().all())

async def get_project(db: AsyncSession, project_id: uuid.UUID) -> Project | None:
    query = select(Project).where(Project.id == project_id).options(selectinload(Project.files))
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_project(db: AsyncSession, workspace_id: uuid.UUID, data: ProjectCreate) -> Project:
    project = Project(
        workspace_id=workspace_id,
        **data.model_dump()
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

async def update_project(db: AsyncSession, project_id: uuid.UUID, data: ProjectUpdate) -> Project | None:
    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        return await get_project(db, project_id)
        
    query = update(Project).where(Project.id == project_id).values(**update_data)
    await db.execute(query)
    await db.commit()
    return await get_project(db, project_id)

async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> bool:
    query = delete(Project).where(Project.id == project_id)
    result = await db.execute(query)
    await db.commit()
    return result.rowcount > 0

import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "backend/uploads/projects"

async def add_project_file(db: AsyncSession, project_id: uuid.UUID, upload_file: UploadFile) -> ProjectFile:
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_id = uuid.uuid4()
    extension = os.path.splitext(upload_file.filename)[1]
    save_path = f"{UPLOAD_DIR}/{file_id}{extension}"
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    project_file = ProjectFile(
        id=file_id,
        project_id=project_id,
        filename=upload_file.filename,
        file_path=save_path,
        file_type=extension.strip("."),
    )
    db.add(project_file)
    await db.commit()
    await db.refresh(project_file)
    return project_file

async def remove_project_file(db: AsyncSession, file_id: uuid.UUID) -> bool:
    query = select(ProjectFile).where(ProjectFile.id == file_id)
    result = await db.execute(query)
    project_file = result.scalar_one_or_none()
    
    if not project_file:
        return False
        
    # Remove from filesystem
    if os.path.exists(project_file.file_path):
        os.remove(project_file.file_path)
        
    await db.delete(project_file)
    await db.commit()
    return True
