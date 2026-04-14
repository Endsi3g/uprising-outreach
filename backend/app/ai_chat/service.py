"""AI Chat orchestration — routes to the correct provider, persists conversations."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any, AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai_chat.models import AIConversation, AIMessage
from app.ai_chat.schemas import ChatRequest
from app.ai_chat.tools.registry import TOOL_DEFINITIONS, execute_tool


_CLAUDE_MODELS = {"claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-6"}


def _is_claude(model: str) -> bool:
    return model in _CLAUDE_MODELS or model.startswith("claude-")


def _is_ollama(model: str) -> bool:
    return model.startswith("ollama/")


async def get_or_create_conversation(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    conversation_id: str | None,
    model: str,
    first_user_message: str,
) -> AIConversation:
    if conversation_id:
        result = await db.execute(
            select(AIConversation).where(
                AIConversation.id == uuid.UUID(conversation_id),
                AIConversation.workspace_id == workspace_id,
            )
        )
        conv = result.scalar_one_or_none()
        if conv:
            return conv

    # Auto-title from first 60 chars of the first message
    title = first_user_message[:60].strip()
    conv = AIConversation(
        workspace_id=workspace_id,
        user_id=user_id,
        model=model,
        title=title or "Nouvelle conversation",
    )
    db.add(conv)
    await db.flush()  # get the id without committing
    return conv


async def save_exchange(
    db: AsyncSession,
    conversation: AIConversation,
    user_content: str,
    assistant_content: str,
    model: str,
    tool_calls: list | None = None,
    tool_results: list | None = None,
) -> None:
    db.add(AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=user_content,
        model=None,
    ))
    db.add(AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_content,
        model=model,
        tool_calls=tool_calls,
        tool_results=tool_results,
    ))
    await db.commit()


async def stream_chat(
    request: ChatRequest,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> AsyncGenerator[str, None]:
    """Main entry point — returns an async generator of SSE strings."""

    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    page_ctx = request.page_context.model_dump() if request.page_context else None

    # Get/create conversation for persistence
    first_user = next((m["content"] for m in messages if m["role"] == "user"), "")
    conv = await get_or_create_conversation(
        db, workspace_id, user_id, request.conversation_id, request.model, first_user
    )

    # Emit conversation_id immediately so frontend can track it
    import json
    yield f"data: {json.dumps({'t': 'meta', 'conversation_id': str(conv.id)})}\n\n"

    # Build tool executor bound to this workspace+db
    async def tool_executor(name: str, tool_input: dict[str, Any]) -> dict[str, Any]:
        return await execute_tool(name, tool_input, workspace_id, db)

    # Collect full assistant response for persistence
    full_text = ""
    recorded_tool_calls: list = []
    recorded_tool_results: list = []

    if _is_claude(request.model):
        from app.ai_chat.providers.claude import stream_claude
        tools = TOOL_DEFINITIONS if request.tools_enabled else []
        async for chunk in stream_claude(
            model=request.model,
            messages=messages,
            tool_definitions=tools,
            page_context=page_ctx,
            tool_executor=tool_executor,
        ):
            yield chunk
            # Capture text for persistence
            try:
                data = json.loads(chunk[6:])  # strip "data: "
                if data.get("t") == "text":
                    full_text += data.get("v", "")
                elif data.get("t") == "tool_use":
                    recorded_tool_calls.append(data)
                elif data.get("t") == "tool_result":
                    recorded_tool_results.append(data)
            except (json.JSONDecodeError, ValueError):
                pass

    elif _is_ollama(request.model):
        from app.ai_chat.providers.ollama import stream_ollama
        async for chunk in stream_ollama(
            model=request.model,
            messages=messages,
            page_context=page_ctx,
        ):
            yield chunk
            try:
                data = json.loads(chunk[6:])
                if data.get("t") == "text":
                    full_text += data.get("v", "")
            except (json.JSONDecodeError, ValueError):
                pass

    else:
        yield f"data: {json.dumps({'t': 'error', 'message': f'Modèle inconnu: {request.model}'})}\n\n"
        return

    # Persist the exchange
    await save_exchange(
        db, conv,
        user_content=first_user,
        assistant_content=full_text,
        model=request.model,
        tool_calls=recorded_tool_calls or None,
        tool_results=recorded_tool_results or None,
    )


async def list_conversations(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[AIConversation]:
    result = await db.execute(
        select(AIConversation)
        .where(
            AIConversation.workspace_id == workspace_id,
            AIConversation.user_id == user_id,
        )
        .order_by(AIConversation.updated_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_conversation_messages(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    conversation_id: uuid.UUID,
) -> list[AIMessage]:
    result = await db.execute(
        select(AIMessage)
        .join(AIConversation, AIMessage.conversation_id == AIConversation.id)
        .where(
            AIConversation.id == conversation_id,
            AIConversation.workspace_id == workspace_id,
        )
        .order_by(AIMessage.created_at.asc())
    )
    return list(result.scalars().all())
