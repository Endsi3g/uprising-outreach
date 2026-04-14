import uuid
from datetime import datetime

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class ChatMessageInput(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class PageContext(BaseModel):
    page: str | None = None
    selected_lead_ids: list[str] = []


class ChatRequest(BaseModel):
    model: str = "claude-sonnet-4-6"
    messages: list[ChatMessageInput]
    conversation_id: str | None = None
    page_context: PageContext | None = None
    tools_enabled: bool = True


# ---------------------------------------------------------------------------
# Response objects (streamed as SSE chunks)
# ---------------------------------------------------------------------------

class StreamChunk(BaseModel):
    """Represents one SSE event payload."""
    t: str  # "text" | "tool_use" | "tool_result" | "done" | "error"
    # text delta
    v: str | None = None
    # tool use
    name: str | None = None
    call_id: str | None = None
    input: dict | None = None
    # tool result
    output: dict | None = None
    # done
    conversation_id: str | None = None
    # error
    message: str | None = None


# ---------------------------------------------------------------------------
# REST responses
# ---------------------------------------------------------------------------

class ConversationResponse(BaseModel):
    id: uuid.UUID
    model: str
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    model: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
