from app.auth import service, invitation_service
from app.auth.dependencies import get_current_user
from app.auth.models import User, Role
from app.auth.schemas import (
    InvitationCreate,
    InvitationResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.database import get_db
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    _user, access_token, refresh_token = await service.register(db, payload)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    _user, access_token, refresh_token = await service.login(db, payload)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    access_token, refresh_token = await service.refresh(db, payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/invite", response_model=InvitationResponse, status_code=201)
async def invite_member(
    payload: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InvitationResponse:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can invite members")
    
    invitation = await invitation_service.create_invitation(
        db, current_user.workspace_id, current_user.id, payload
    )
    return InvitationResponse.model_validate(invitation)


@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    invitation = await invitation_service.get_invitation_by_token(db, token)
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    await invitation_service.accept_invitation(db, invitation)
    return {"message": "Invitation accepted successfully"}
