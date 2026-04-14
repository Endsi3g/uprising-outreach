"""Facebook / Meta background tasks."""

from __future__ import annotations

import logging
import uuid

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def process_facebook_message(
    ctx: dict,
    workspace_id: str,
    page_id: str,
    messaging: dict,
) -> dict:
    """Persist a Messenger message event as an InboxConversation + InboxMessage.

    Delegated from the webhook handler for heavier dedup / classification work.
    """
    from app.database import AsyncSessionLocal
    from app.webhooks.facebook import handle_messaging_event

    ws_uuid = uuid.UUID(workspace_id)
    async with AsyncSessionLocal() as db:
        await handle_messaging_event(db, ws_uuid, page_id, messaging)

    return {"status": "ok", "page_id": page_id}


async def import_facebook_lead(
    ctx: dict,
    workspace_id: str,
    page_id: str,
    leadgen_id: str,
    form_id: str,
) -> dict:
    """Fetch lead details from Facebook Graph API and create/update a Lead.

    Uses the page access token stored in SenderAccount to call:
      GET /{leadgen_id}?fields=field_data&access_token=...
    """
    from app.database import AsyncSessionLocal
    from app.companies.models import Company
    from app.contacts.models import Contact
    from app.leads.models import Lead
    from app.senders.models import EmailProvider, SenderAccount
    from sqlalchemy import select

    ws_uuid = uuid.UUID(workspace_id)

    async with AsyncSessionLocal() as db:
        # Resolve page access token
        result = await db.execute(
            select(SenderAccount).where(
                SenderAccount.workspace_id == ws_uuid,
                SenderAccount.provider == EmailProvider.FACEBOOK,
                SenderAccount.email_address == page_id,
                SenderAccount.deleted_at.is_(None),
            )
        )
        sender = result.scalar_one_or_none()
        if not sender or not sender.oauth_access_token:
            logger.warning("No Facebook SenderAccount for workspace %s page %s", workspace_id, page_id)
            return {"status": "skipped", "reason": "no_sender_account"}

        page_token: str = sender.oauth_access_token
        graph_base = f"https://graph.facebook.com/{settings.facebook_graph_version}"

        # Fetch lead field data from Graph API
        async with httpx.AsyncClient() as http:
            resp = await http.get(
                f"{graph_base}/{leadgen_id}",
                params={"fields": "field_data,created_time", "access_token": page_token},
            )
            if resp.status_code != 200:
                logger.warning("Graph API error for leadgen %s: %s", leadgen_id, resp.text)
                return {"status": "error", "code": resp.status_code}
            data = resp.json()

        # Parse field_data into a flat dict
        fields: dict[str, str] = {}
        for field in data.get("field_data", []):
            values = field.get("values", [])
            fields[field["name"]] = values[0] if values else ""

        email = fields.get("email", "")
        first_name = fields.get("first_name", "")
        last_name = fields.get("last_name", "")
        full_name = fields.get("full_name", f"{first_name} {last_name}".strip())
        company_name = fields.get("company_name", "")
        phone = fields.get("phone_number", fields.get("phone", ""))
        job_title = fields.get("job_title", "")

        if not email:
            return {"status": "skipped", "reason": "no_email"}

        # Find or create company
        company_id = None
        if company_name:
            r = await db.execute(
                select(Company).where(
                    Company.workspace_id == ws_uuid,
                    Company.name == company_name,
                    Company.deleted_at.is_(None),
                )
            )
            company = r.scalar_one_or_none()
            if not company:
                company = Company(workspace_id=ws_uuid, name=company_name, source="facebook_lead_ad")
                db.add(company)
                await db.flush()
            company_id = company.id

        # Find or create contact
        r = await db.execute(
            select(Contact).where(
                Contact.workspace_id == ws_uuid,
                Contact.email == email,
                Contact.deleted_at.is_(None),
            )
        )
        contact = r.scalar_one_or_none()
        if not contact:
            name_parts = full_name.split(" ", 1)
            contact = Contact(
                workspace_id=ws_uuid,
                company_id=company_id,
                email=email,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else "",
                phone=phone or None,
                job_title=job_title or None,
            )
            db.add(contact)
            await db.flush()

        # Dedup lead
        r = await db.execute(
            select(Lead).where(
                Lead.workspace_id == ws_uuid,
                Lead.contact_id == contact.id,
                Lead.deleted_at.is_(None),
            )
        )
        if r.scalar_one_or_none():
            return {"status": "skipped", "reason": "duplicate_lead"}

        lead = Lead(
            workspace_id=ws_uuid,
            company_id=company_id,
            contact_id=contact.id,
            source="facebook_lead_ad",
            extra={
                "leadgen_id": leadgen_id,
                "form_id": form_id,
                "page_id": page_id,
                "raw_fields": fields,
            },
        )
        db.add(lead)
        await db.commit()

    logger.info("Imported Facebook lead %s for workspace %s", leadgen_id, workspace_id)
    return {"status": "ok", "leadgen_id": leadgen_id}
