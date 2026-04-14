import uuid
from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: uuid.UUID
    direction: str
    sender_name: str
    sender_email: str
    body_text: str
    sent_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: uuid.UUID
    channel: str
    subject: str
    participant_name: str
    participant_email: str
    status: str
    classification: str
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    data: list[ConversationResponse]
    total: int


class ReplyRequest(BaseModel):
    body: str


class UpdateConversationRequest(BaseModel):
    status: str | None = None
    classification: str | None = None
