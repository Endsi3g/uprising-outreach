import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import Role, User
from app.database import get_db
from app.senders import service
from app.senders.schemas import (
    DNSStatusResponse,
    SenderCreate,
    SenderResponse,
    SenderUpdate,
)

router = APIRouter(prefix="/senders", tags=["senders"])


@router.get("/oauth/gmail")
async def start_google_oauth(
    current_user: User = Depends(get_current_user),
):
    """Start the Google OAuth flow for Gmail."""
    from app.senders.oauth import get_google_auth_url
    # Use workspace_id as state for simple validation
    state = str(current_user.workspace_id)
    url = get_google_auth_url(state=state)
    return {"url": url}


@router.get("/oauth/gmail/callback")
async def google_oauth_callback(
    request: Request,
    state: str,
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """Callback for Google OAuth."""
    from app.senders.oauth import get_google_auth_flow
    from app.senders import service
    import uuid
    
    workspace_id = uuid.UUID(state)
    flow = get_google_auth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Process the tokens and create/update sender account
    await service.register_google_sender(db, workspace_id, credentials)
    
    # Redirect back to frontend
    from app.config import settings
    frontend_url = f"{settings.cors_origins_list[0]}/settings/senders?success=true"
    return RedirectResponse(url=frontend_url)


@router.get("", response_model=list[SenderResponse])
async def list_senders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SenderResponse]:
    senders = await service.list_senders(db, current_user.workspace_id)
    return [SenderResponse.model_validate(s) for s in senders]


@router.post("", response_model=SenderResponse, status_code=201)
async def create_sender(
    payload: SenderCreate,
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER)),
    db: AsyncSession = Depends(get_db),
) -> SenderResponse:
    sender = await service.create_sender(db, current_user.workspace_id, payload)
    return SenderResponse.model_validate(sender)


@router.get("/{sender_id}", response_model=SenderResponse)
async def get_sender(
    sender_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SenderResponse:
    sender = await service.get_sender(db, current_user.workspace_id, sender_id)
    return SenderResponse.model_validate(sender)


@router.get("/{sender_id}/verify", response_model=DNSStatusResponse)
async def verify_dns(
    sender_id: uuid.UUID,
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER)),
    db: AsyncSession = Depends(get_db),
) -> DNSStatusResponse:
    """Run SPF, DKIM, and DMARC DNS checks for this sender's domain."""
    dns_result = await service.verify_dns(db, current_user.workspace_id, sender_id)
    return DNSStatusResponse(**dns_result.to_dict())


@router.patch("/{sender_id}", response_model=SenderResponse)
async def update_sender(
    sender_id: uuid.UUID,
    payload: SenderUpdate,
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER)),
    db: AsyncSession = Depends(get_db),
) -> SenderResponse:
    sender = await service.update_sender(db, current_user.workspace_id, sender_id, payload)
    return SenderResponse.model_validate(sender)


@router.delete("/{sender_id}", status_code=204)
async def delete_sender(
    sender_id: uuid.UUID,
    current_user: User = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_sender(db, current_user.workspace_id, sender_id)
