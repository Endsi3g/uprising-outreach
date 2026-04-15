import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import Role, User
from app.database import get_db
from app.leads import service
from app.leads.schemas import (
    BulkActionRequest,
    BulkActionResponse,
    CSVImportResponse,
    LeadCreate,
    LeadFilter,
    LeadResponse,
    LeadStatsResponse,
    LeadUpdate,
    ApifyImportRequest,
    ImportResponse,
)
from app.shared.pagination import Page

class EmailPayload(BaseModel):
    subject: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    sender_id: uuid.UUID | None = None

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/stats", response_model=LeadStatsResponse)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadStatsResponse:
    stats = await service.get_lead_stats(db, current_user.workspace_id)
    return LeadStatsResponse.model_validate(stats)


@router.get("", response_model=Page[LeadResponse])
async def list_leads(
    cursor: str | None = Query(None),
    limit: int = Query(25, ge=1, le=100),
    status: list[str] | None = Query(None),
    owner_id: uuid.UUID | None = Query(None),
    score_min: int | None = Query(None),
    score_max: int | None = Query(None),
    source: str | None = Query(None),
    q: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Page[LeadResponse]:
    from app.leads.models import LeadStatus
    filters = LeadFilter(
        status=[LeadStatus(s) for s in status] if status else None,
        owner_id=owner_id,
        score_min=score_min,
        score_max=score_max,
        source=source,
    )
    return await service.list_leads(db, current_user.workspace_id, filters, cursor, limit, q=q)


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    payload: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    lead = await service.create_lead(db, current_user.workspace_id, payload)
    # The service now returns an object with contact/company loaded
    lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
    if lead.contact:
        lead_dict.update({
            "first_name": lead.contact.first_name,
            "last_name": lead.contact.last_name,
            "email": lead.contact.email,
            "job_title": lead.contact.job_title,
        })
    if lead.company:
        lead_dict.update({
            "company_name": lead.company.name,
            "domain": lead.company.domain,
        })
    return LeadResponse.model_validate(lead_dict)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
) -> LeadResponse:
    from sqlalchemy.orm import joinedload
    from sqlalchemy import select
    from app.leads.models import Lead
    
    result = await db.execute(
        select(Lead)
        .options(joinedload(Lead.contact), joinedload(Lead.company))
        .where(
            Lead.id == lead_id,
            Lead.workspace_id == current_user.workspace_id,
            Lead.deleted_at.is_(None),
        )
    )
    lead = result.scalar_one_or_none()
    if not lead:
        from app.shared.exceptions import raise_not_found
        raise_not_found("Lead", str(lead_id))
        
    lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
    if lead.contact:
        lead_dict.update({
            "first_name": lead.contact.first_name,
            "last_name": lead.contact.last_name,
            "email": lead.contact.email,
            "job_title": lead.contact.job_title,
        })
    if lead.company:
        lead_dict.update({
            "company_name": lead.company.name,
            "domain": lead.company.domain,
        })
    return LeadResponse.model_validate(lead_dict)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeadResponse:
    lead = await service.update_lead(db, current_user.workspace_id, lead_id, payload)
    return LeadResponse.model_validate(lead)


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_lead(db, current_user.workspace_id, lead_id)


@router.post("/bulk", response_model=BulkActionResponse)
async def bulk_action(
    payload: BulkActionRequest,
    current_user: User = Depends(
        get_current_user  # Manager+ for delete/suppress; SDR for enrich/assign
    ),
    db: AsyncSession = Depends(get_db),
) -> BulkActionResponse:
    return await service.bulk_action(db, current_user.workspace_id, payload)

@router.post("/import/apify", response_model=ImportResponse)
async def import_apify(
    payload: ApifyImportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImportResponse:
    """Import leads directly from an Apify dataset."""
    from app.shared.exceptions import BusinessRuleError
    
    try:
        processed = await service.import_leads_from_apify(
            db, 
            current_user.workspace_id, 
            payload.dataset_id, 
            payload.token
        )
        return ImportResponse(
            items_count=processed, 
            message=f"Successfully imported {processed} leads from Apify."
        )
    except Exception as e:
        raise BusinessRuleError(f"Apify import failed: {str(e)}")


@router.post("/import/csv", response_model=ImportResponse)
async def import_csv_direct(
    file: Annotated[UploadFile, File()],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImportResponse:
    """Import leads from an Apify or standard CSV with auto-mapping."""
    from app.shared.exceptions import BusinessRuleError
    
    content = await file.read()
    try:
        items = service.parse_csv_to_leads(content)
        # Limit to 500 for sync processing to avoid timeouts
        if len(items) > 500:
            items = items[:500]
            
        processed = await service.process_lead_import_batch(db, current_user.workspace_id, items, source="CSV Auto-Import")
        return ImportResponse(
            items_count=processed,
            message=f"Successfully imported {processed} leads from CSV."
        )
    except Exception as e:
        raise BusinessRuleError(f"CSV import failed: {str(e)}")


@router.post("/import", response_model=CSVImportResponse, status_code=202)
async def import_csv(
    file: Annotated[UploadFile, File()],
    column_mapping: Annotated[str, Form()],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CSVImportResponse:
    """
    Upload a CSV file and provide a JSON column mapping.

    column_mapping format: '{"CSV Column Name": "lead_field", ...}'

    Supported lead fields: email, first_name, last_name, job_title,
    phone, linkedin_url, company_name, domain, source
    """
    import json
    import uuid as _uuid

    from arq import create_pool
    from arq.connections import RedisSettings

    from app.config import settings

    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
    except UnicodeDecodeError:
        import chardet
        encoding = chardet.detect(content)["encoding"] or "latin-1"
        csv_text = content.decode(encoding)

    mapping = json.loads(column_mapping)
    job_id = str(_uuid.uuid4())

    redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    await redis.enqueue_job(
        "import_leads_task",
        job_id=job_id,
        workspace_id=str(current_user.workspace_id),
        csv_content=csv_text,
        column_mapping=mapping,
        owner_id=str(current_user.id),
        _queue_name="outreach:default",
    )
    await redis.aclose()

    return CSVImportResponse(
        job_id=job_id,
        message="Import job queued. Poll GET /api/v1/jobs/{job_id} for progress.",
    )


@router.get("/{lead_id}/activity")
async def get_lead_activity(
    lead_id: uuid.UUID,
    cursor: str | None = Query(None),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    from sqlalchemy import select
    from app.leads.models import ActivityLog
    from app.shared.pagination import build_page, decode_cursor

    # Verify lead belongs to workspace
    await service.get_lead(db, current_user.workspace_id, lead_id)

    query = (
        select(ActivityLog)
        .where(
            ActivityLog.workspace_id == current_user.workspace_id,
            ActivityLog.entity_id == lead_id,
            ActivityLog.deleted_at.is_(None),
        )
        .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
    )

    if cursor:
        created_at, cid = decode_cursor(cursor)
        query = query.where(
            (ActivityLog.created_at < created_at)
            | ((ActivityLog.created_at == created_at) & (ActivityLog.id < cid))
        )

    from sqlalchemy import func
    total_result = await db.execute(
        select(func.count()).select_from(ActivityLog).where(
            ActivityLog.workspace_id == current_user.workspace_id,
            ActivityLog.entity_id == lead_id,
        )
    )
    total = total_result.scalar_one()

    result = await db.execute(query.limit(limit + 1))
    items = list(result.scalars().all())
    page = build_page(items, limit, total)

    return {
        "data": [
            {
                "id": str(a.id),
                "event_type": a.event_type,
                "payload": a.payload,
                "created_at": a.created_at.isoformat(),
            }
            for a in page["data"]
        ],
        "pagination": page["pagination"],
    }


@router.post("/{lead_id}/email")
async def send_lead_email(
    lead_id: uuid.UUID,
    payload: EmailPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.senders import service as sender_service
    from app.leads import service as lead_service
    from app.senders.models import SenderAccount, SenderStatus
    from app.shared.exceptions import BusinessRuleError
    from sqlalchemy import select

    # 1. Get lead and contact email
    lead = await lead_service.get_lead(db, current_user.workspace_id, lead_id)
    if not lead.contact or not lead.contact.email:
        raise BusinessRuleError("Lead has no contact or email address.")

    # 2. Get sender account
    if payload.sender_id:
        sender = await sender_service.get_sender(db, current_user.workspace_id, payload.sender_id)
    else:
        # Get first active sender for workspace
        result = await db.execute(
            select(SenderAccount).where(
                SenderAccount.workspace_id == current_user.workspace_id,
                SenderAccount.status == SenderStatus.ACTIVE,
                SenderAccount.deleted_at.is_(None)
            )
        )
        sender = result.scalar_one_or_none()
    
    if not sender:
        raise BusinessRuleError("No active sender account found. Please connect Gmail first.")

    # 3. Send email
    try:
        message_id = await sender_service.send_gmail(
            sender,
            lead.contact.email,
            payload.subject,
            payload.content
        )
        
        # 4. Log activity
        from app.leads.models import ActivityLog
        activity = ActivityLog(
            workspace_id=current_user.workspace_id,
            entity_type="lead",
            entity_id=lead_id,
            actor_id=current_user.id,
            event_type="email_sent",
            payload={
                "message_id": message_id,
                "sender_email": sender.email_address,
                "subject": payload.subject
            }
        )
        db.add(activity)
        await db.commit()
        
        return {"status": "success", "message_id": message_id}
    except Exception as e:
        raise BusinessRuleError(f"Email sending failed: {str(e)}")
