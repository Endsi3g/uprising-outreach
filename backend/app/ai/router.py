from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.ai.nanoclaw import NanoClawAssistant

router = APIRouter(prefix="/ai", tags=["ai"])

class TitleGenerationRequest(BaseModel):
    first_message: str

class SecretaryRequest(BaseModel):
    user_input: str

@router.post("/generate-title")
async def generate_title(request: TitleGenerationRequest):
    assistant = NanoClawAssistant()
    title = await assistant.generate_chat_title(request.first_message)
    return {"title": title}

@router.post("/secretary")
async def secretary_interaction(request: SecretaryRequest):
    assistant = NanoClawAssistant()
    result = await assistant.process_secretary_request(request.user_input)
    return result
