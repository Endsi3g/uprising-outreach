import logging
import uuid
from app.enrichment.playwright_service import capture_linkedin_profile

logger = logging.getLogger(__name__)

async def capture_linkedin_lead_task(
    ctx: dict,
    job_id: str,
    workspace_id: str,
    url: str
) -> dict:
    """
    Tâche de fond pour capturer les données LinkedIn et créer/mettre à jour un lead.
    """
    from app.database import AsyncSessionLocal
    from app.leads.models import Lead, LeadStatus
    from app.companies.models import Company
    from app.contacts.models import Contact
    from sqlalchemy import select

    ws_uuid = uuid.UUID(workspace_id)
    
    # 1. Capture via Playwright
    # Note: Dans une version réelle, on récupérerait le li_at depuis les settings du workspace
    capture_data = await capture_linkedin_profile(url)
    
    if "error" in capture_data and capture_data.get("full_name") == "Profil à réviser":
        return {"status": "failed", "error": capture_data["error"]}

    async with AsyncSessionLocal() as db:
        # 2. Gérer la Compagnie
        company_name = capture_data.get("company", "Inconnue")
        result = await db.execute(
            select(Company).where(
                Company.workspace_id == ws_uuid,
                Company.name == company_name,
                Company.deleted_at.is_(None)
            )
        )
        company = result.scalar_one_or_none()
        if not company:
            company = Company(
                workspace_id=ws_uuid,
                name=company_name,
                source="linkedin_capture"
            )
            db.add(company)
            await db.flush()

        # 3. Gérer le Contact
        full_name = capture_data.get("full_name", "Prospection")
        name_parts = full_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        contact = Contact(
            workspace_id=ws_uuid,
            company_id=company.id,
            first_name=first_name,
            last_name=last_name,
            job_title=capture_data.get("job_title"),
            linkedin_url=url
        )
        db.add(contact)
        await db.flush()

        # 4. Créer le Lead
        lead = Lead(
            workspace_id=ws_uuid,
            company_id=company.id,
            contact_id=contact.id,
            status=LeadStatus.ENRICHED,
            source="linkedin_capture",
            notes=capture_data.get("summary"),
            extra={"capture_job_id": job_id}
        )
        db.add(lead)
        await db.commit()

    logger.info(f"Capture réussie pour {url} -> Lead créé.")
    return {"status": "completed", "lead_name": full_name}
