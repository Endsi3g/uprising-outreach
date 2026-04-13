from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.exceptions import ConflictError, NotFoundError
from app.workspaces.models import Workspace
from app.workspaces.schemas import WorkspaceCreate


async def create_workspace(db: AsyncSession, payload: WorkspaceCreate) -> Workspace:
    existing = await db.execute(select(Workspace).where(Workspace.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise ConflictError(f"Workspace with slug '{payload.slug}' already exists")

    workspace = Workspace(**payload.model_dump())
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


async def get_workspace(db: AsyncSession, workspace_id: str) -> Workspace:
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if not workspace:
        raise NotFoundError(f"Workspace '{workspace_id}' not found")
    return workspace
