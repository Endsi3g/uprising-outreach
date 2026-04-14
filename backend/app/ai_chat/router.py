import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_db
from app.ai_chat import service
from app.ai_chat.schemas import (
    ChatRequest,
    ConversationResponse,
    MessageResponse,
)

router = APIRouter(prefix="/ai", tags=["ai-chat"])


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Stream a chat response as Server-Sent Events.

    Each event: `data: {json}\\n\\n`
    Event types: meta | text | tool_use | tool_result | done | error
    """
    generator = service.stream_chat(
        request=request,
        workspace_id=current_user.workspace_id,
        user_id=current_user.id,
        db=db,
    )
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ConversationResponse]:
    convs = await service.list_conversations(db, current_user.workspace_id, current_user.id)
    return [ConversationResponse.model_validate(c) for c in convs]


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageResponse]:
    msgs = await service.get_conversation_messages(db, current_user.workspace_id, conversation_id)
    return [MessageResponse.model_validate(m) for m in msgs]
