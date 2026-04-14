from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.workspaces.schemas import WorkspaceCreate, WorkspaceResponse
from app.workspaces.service import create_workspace, get_workspace

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace_endpoint(
    payload: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    workspace = await create_workspace(db, payload)
    return WorkspaceResponse.model_validate(workspace)
