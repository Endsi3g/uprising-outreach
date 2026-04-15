import uuid

from fastapi import Depends

from app.auth.dependencies import get_current_user
from app.auth.models import User


async def get_current_workspace_id(
    current_user: User = Depends(get_current_user),
) -> uuid.UUID:
    """Extract workspace_id from the authenticated user."""
    return current_user.workspace_id
