from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.ai.nanoclaw import NanoClawAssistant
from app.enrichment.playwright_service import scrape_page_content

router = APIRouter(prefix="/ai", tags=["ai"])

class TitleGenerationRequest(BaseModel):
    first_message: str

import uuid

class SecretaryRequest(BaseModel):
    user_input: str

class AnalyzePageRequest(BaseModel):
    url: str

@router.post("/analyze-page")
async def analyze_page(
    request: AnalyzePageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    text = await scrape_page_content(request.url)
    prompt = f"Analyse cette page pour la prospection :\nURL: {request.url}\nContenu extrait via Playwright:\n{text}\n\nDonne moi 3 insights clés pour approcher ce prospect de manière hyper-personnalisée. Formate la réponse en Markdown avec des tirets."
    
    assistant = NanoClawAssistant()
    result = await assistant.process_secretary_request(
        prompt, 
        workspace_id=current_user.workspace_id,
        db_session=db
    )
    return result

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
