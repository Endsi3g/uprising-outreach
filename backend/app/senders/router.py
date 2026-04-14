import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_role
from app.auth.models import Role, User
from app.database import get_db
from app.senders import service
from app.senders.models import EmailProvider
from app.senders.oauth import (
    create_oauth_state,
    decode_oauth_state,
    gmail_authorization_url,
    gmail_exchange_code,
    outlook_authorization_url,
    outlook_exchange_code,
)
from app.senders.schemas import (
    DNSStatusResponse,
    OAuthAuthorizeResponse,
    SenderCreate,
    SenderResponse,
    SenderUpdate,
)

router = APIRouter(prefix="/senders", tags=["senders"])


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


# ---------------------------------------------------------------------------
# OAuth endpoints
# ---------------------------------------------------------------------------

_FRONTEND_SETTINGS_URL = "http://localhost:3000/settings?tab=Connecteurs"
_SUPPORTED_PROVIDERS = {EmailProvider.GMAIL, EmailProvider.OUTLOOK}


@router.get("/oauth/{provider}/authorize", response_model=OAuthAuthorizeResponse)
async def oauth_authorize(
    provider: EmailProvider,
    current_user: User = Depends(require_role(Role.ADMIN, Role.MANAGER)),
) -> OAuthAuthorizeResponse:
    """Return the OAuth2 consent URL for the given provider.

    The frontend should redirect the user's browser to `authorization_url`.
    """
    if provider not in _SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"OAuth not supported for provider '{provider}'")

    state = create_oauth_state(current_user.workspace_id, current_user.id)

    if provider == EmailProvider.GMAIL:
        auth_url = gmail_authorization_url(state)
    else:
        auth_url = outlook_authorization_url(state)

    return OAuthAuthorizeResponse(authorization_url=auth_url, provider=provider)


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: EmailProvider,
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    """Handle the OAuth2 callback from Google / Microsoft.

    Exchanges the auth code for tokens, creates or updates the SenderAccount,
    and redirects the browser back to the frontend settings page.
    """
    error_redirect = f"{_FRONTEND_SETTINGS_URL}&status=error"

    if error or not code or not state:
        reason = error or ("missing_code" if not code else "missing_state")
        return RedirectResponse(f"{error_redirect}&message={reason}")

    try:
        workspace_id, _user_id = decode_oauth_state(state)
    except ValueError:
        return RedirectResponse(f"{error_redirect}&message=invalid_state")

    try:
        if provider == EmailProvider.GMAIL:
            token_data = await gmail_exchange_code(code)
        elif provider == EmailProvider.OUTLOOK:
            token_data = await outlook_exchange_code(code)
        else:
            return RedirectResponse(f"{error_redirect}&message=unsupported_provider")
    except Exception:
        return RedirectResponse(f"{error_redirect}&message=token_exchange_failed")

    await service.upsert_oauth_sender(db, workspace_id, provider, token_data)

    return RedirectResponse(f"{_FRONTEND_SETTINGS_URL}&status=connected&provider={provider.value}")
