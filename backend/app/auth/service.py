from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import Role, User
from app.auth.schemas import LoginRequest, RegisterRequest
from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.shared.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.workspaces.models import Workspace


async def register(db: AsyncSession, payload: RegisterRequest) -> tuple[User, str, str]:
    # Check slug uniqueness
    existing_ws = await db.execute(
        select(Workspace).where(Workspace.slug == payload.workspace_slug)
    )
    if existing_ws.scalar_one_or_none():
        raise ConflictError(f"Workspace slug '{payload.workspace_slug}' is already taken")

    # Check email uniqueness across workspace (email+workspace combo must be unique)
    # For the first user, just check globally
    existing_user = await db.execute(select(User).where(User.email == payload.email))
    if existing_user.scalar_one_or_none():
        raise ConflictError("An account with this email already exists")

    workspace = Workspace(
        name=payload.workspace_name,
        slug=payload.workspace_slug,
    )
    db.add(workspace)
    await db.flush()  # get workspace.id without committing

    user = User(
        workspace_id=workspace.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        role=Role.ADMIN,  # first user in workspace is always admin
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(str(user.id), str(workspace.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))
    return user, access_token, refresh_token


async def login(db: AsyncSession, payload: LoginRequest) -> tuple[User, str, str]:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedError("Account is inactive")

    user.last_login_at = datetime.now(UTC)
    await db.commit()

    access_token = create_access_token(str(user.id), str(user.workspace_id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))
    return user, access_token, refresh_token


async def refresh(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
    try:
        payload = decode_token(refresh_token)
    except ValueError as e:
        raise UnauthorizedError(str(e))

    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type")

    import uuid
    result = await db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    new_access = create_access_token(str(user.id), str(user.workspace_id), user.role.value)
    new_refresh = create_refresh_token(str(user.id))
    return new_access, new_refresh
