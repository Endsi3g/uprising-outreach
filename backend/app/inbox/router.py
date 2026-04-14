import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_db
from app.inbox import service
from app.inbox.schemas import (
    ConversationListResponse,
    ConversationResponse,
    MessageResponse,
    ReplyRequest,
    UpdateConversationRequest,
)

router = APIRouter(prefix="/inbox", tags=["inbox"])


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    channel: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationListResponse:
    convs, total = await service.list_conversations(
        db, current_user.workspace_id, channel=channel, status=status,
        limit=limit, offset=offset,
    )
    return ConversationListResponse(
        data=[ConversationResponse.model_validate(c) for c in convs],
        total=total,
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    conv = await service.get_conversation(db, current_user.workspace_id, conversation_id)
    return ConversationResponse.model_validate(conv)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageResponse]:
    await service.get_conversation(db, current_user.workspace_id, conversation_id)
    msgs = await service.get_messages(db, conversation_id)
    return [MessageResponse.model_validate(m) for m in msgs]


@router.post("/conversations/{conversation_id}/reply", response_model=MessageResponse, status_code=201)
async def reply(
    conversation_id: uuid.UUID,
    payload: ReplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    msg = await service.send_reply(db, current_user.workspace_id, conversation_id, payload.body)
    return MessageResponse.model_validate(msg)


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: uuid.UUID,
    payload: UpdateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationResponse:
    conv = await service.update_conversation(
        db, current_user.workspace_id, conversation_id,
        status=payload.status, classification=payload.classification,
    )
    return ConversationResponse.model_validate(conv)
