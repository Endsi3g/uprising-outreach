from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.workspaces.dependencies import get_current_workspace_id
from . import models, schemas
from uuid import UUID
from typing import List

router = APIRouter(prefix="/customization", tags=["customization"])

# ── Skills ────────────────────────────────────────────────────────────────────

@router.get("/skills", response_model=List[schemas.SkillRead])
async def list_skills(
    db: AsyncSession = Depends(get_db),
    workspace_id: UUID = Depends(get_current_workspace_id),
):
    result = await db.execute(
        select(models.Skill).where(models.Skill.workspace_id == workspace_id)
    )
    return result.scalars().all()

@router.post("/skills", response_model=schemas.SkillRead)
async def create_skill(
    skill: schemas.SkillCreate,
    db: AsyncSession = Depends(get_db),
    workspace_id: UUID = Depends(get_current_workspace_id),
):
    db_skill = models.Skill(**skill.model_dump(), workspace_id=workspace_id)
    db.add(db_skill)
    await db.commit()
    await db.refresh(db_skill)
    return db_skill

@router.patch("/skills/{skill_id}", response_model=schemas.SkillRead)
async def update_skill(
    skill_id: UUID,
    skill_update: schemas.SkillUpdate,
    db: AsyncSession = Depends(get_db),
    workspace_id: UUID = Depends(get_current_workspace_id),
):
    db_skill = await db.get(models.Skill, skill_id)
    if not db_skill or db_skill.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    for key, value in skill_update.model_dump(exclude_unset=True).items():
        setattr(db_skill, key, value)
    
    await db.commit()
    await db.refresh(db_skill)
    return db_skill

# ── Connectors ──────────────────────────────────────────────────────────────

@router.get("/connectors", response_model=List[schemas.ConnectorRead])
async def list_connectors(
    db: AsyncSession = Depends(get_db),
    workspace_id: UUID = Depends(get_current_workspace_id),
):
    result = await db.execute(
        select(models.Connector).where(models.Connector.workspace_id == workspace_id)
    )
    return result.scalars().all()

@router.patch("/connectors/{connector_id}", response_model=schemas.ConnectorRead)
async def update_connector(
    connector_id: UUID,
    permissions: dict,
    db: AsyncSession = Depends(get_db),
    workspace_id: UUID = Depends(get_current_workspace_id),
):
    db_connector = await db.get(models.Connector, connector_id)
    if not db_connector or db_connector.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    db_connector.permissions = permissions
    await db.commit()
    await db.refresh(db_connector)
    return db_connector
