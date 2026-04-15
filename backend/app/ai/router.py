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

class CaptureLeadRequest(BaseModel):
    url: str
    metadata: dict | None = None

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

@router.post("/capture-lead")
async def capture_lead(
    request: CaptureLeadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.ai.service import SCORING_PROMPT, score_lead_with_ai
    from app.leads.service import process_lead_import_batch
    import json
    
    # 1. Scrape content
    text = await scrape_page_content(request.url)
    
    # 2. Extract structured data via AI
    extraction_prompt = f"""
    Tu es un assistant d'extraction de données. Analyse le contenu suivant d'une page web et extrait les informations du prospect.
    Contenu: {text}
    
    Extrait les champs suivants au format JSON :
    - first_name
    - last_name
    - email (si trouvé)
    - job_title
    - company_name
    - linkedin_url (si mentionné dans le texte)
    - website (le domaine de la page)
    
    Renvoie UNIQUEMENT le JSON.
    """
    
    assistant = NanoClawAssistant()
    extraction_res = await assistant.process_secretary_request(
        extraction_prompt,
        workspace_id=current_user.workspace_id,
        db_session=db
    )
    
    # Try to parse the extraction result
    ext_text = extraction_res.get("response_prefix", "")
    try:
        start = ext_text.find("{")
        end = ext_text.rfind("}") + 1
        lead_data = json.loads(ext_text[start:end])
    except:
        lead_data = {
            "first_name": "Inconnu",
            "last_name": "",
            "job_title": "Prospect",
            "company_name": "Entreprise détectée",
        }
    
    lead_data["url"] = request.url
    if request.metadata:
        lead_data.update(request.metadata)
        
    # 3. Save as lead
    import_count = await process_lead_import_batch(
        db, 
        current_user.workspace_id, 
        [lead_data], 
        source="Browser Extension"
    )
    
    # 4. Score the lead (re-fetch the recently created lead)
    from app.leads.models import Lead, Contact
    from sqlalchemy import select
    from sqlalchemy.orm import joinedload
    
    res = await db.execute(
        select(Lead)
        .join(Contact, Lead.contact_id == Contact.id)
        .where(Lead.workspace_id == current_user.workspace_id)
        .order_by(Lead.created_at.desc())
        .limit(1)
    )
    new_lead = res.scalar_one_or_none()
    
    if new_lead:
        score_res = await score_lead_with_ai({
            "first_name": new_lead.contact.first_name,
            "last_name": new_lead.contact.last_name,
            "job_title": new_lead.contact.job_title,
            "notes": text[:1000]
        })
        if score_res:
            new_lead.score = score_res["score"]
            new_lead.notes = score_res["justification"]
            new_lead.temperature = score_res["temperature"]
            await db.commit()
            
        return {
            "id": str(new_lead.id),
            "full_name": f"{new_lead.contact.first_name} {new_lead.contact.last_name}",
            "job_title": new_lead.contact.job_title,
            "score": new_lead.score,
            "justification": new_lead.notes,
            "temperature": new_lead.temperature
        }
    
    return {"error": "Failed to capture lead"}

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
