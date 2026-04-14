from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.ai.nanoclaw import NanoClawAssistant

router = APIRouter(prefix="/ai", tags=["ai"])

class TitleGenerationRequest(BaseModel):
    first_message: str

import uuid

class SecretaryRequest(BaseModel):
    user_input: str

@router.post("/generate-title")
async def generate_title(request: TitleGenerationRequest):
    assistant = NanoClawAssistant()
    title = await assistant.generate_chat_title(request.first_message)
    return {"title": title}

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User
from sqlalchemy.ext.asyncio import AsyncSession

@router.post("/secretary")
async def secretary_interaction(
    request: SecretaryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    assistant = NanoClawAssistant()
    result = await assistant.process_secretary_request(
        request.user_input, 
        workspace_id=current_user.workspace_id,
        db_session=db
    )
    return result
