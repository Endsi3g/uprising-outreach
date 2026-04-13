"""CSV lead import background task."""

import csv
import io
import logging
import uuid

from app.leads.models import Lead

logger = logging.getLogger(__name__)

BATCH_SIZE = 500


async def import_leads_task(
    ctx: dict,
    job_id: str,
    workspace_id: str,
    csv_content: str,
    column_mapping: dict[str, str],
    owner_id: str | None = None,
) -> dict:
    """
    Process a CSV import job.

    column_mapping maps CSV column names → Lead field names.
    e.g. {"Email": "email", "Company": "company_name", ...}

    Idempotency: job_id stored in Redis; if already COMPLETED, skip.
    """
    from arq import ArqRedis
    from app.database import AsyncSessionLocal
    from app.companies.models import Company
    from app.contacts.models import Contact
    from sqlalchemy import select

    redis: ArqRedis = ctx["redis"]

    # Check if already completed
    status_key = f"import_job:{job_id}"
    existing = await redis.hgetall(status_key)
    if existing and existing.get(b"status") == b"completed":
        return {"status": "skipped", "reason": "already_completed"}

    await redis.hset(status_key, mapping={"status": "running", "processed": 0, "failed": 0})  # type: ignore[arg-type]

    ws_uuid = uuid.UUID(workspace_id)
    owner_uuid = uuid.UUID(owner_id) if owner_id else None

    reader = csv.DictReader(io.StringIO(csv_content))
    rows = list(reader)
    total = len(rows)
    processed = 0
    skipped = 0
    errors = []

    async with AsyncSessionLocal() as db:
        batch: list[Lead] = []

        for i, row in enumerate(rows):
            try:
                # Map CSV columns to field names
                mapped = {
                    lead_field: row.get(csv_col, "").strip()
                    for csv_col, lead_field in column_mapping.items()
                    if row.get(csv_col, "").strip()
                }

                email = mapped.get("email")
                company_name = mapped.pop("company_name", None)
                linkedin_url = mapped.pop("linkedin_url", None)
                first_name = mapped.pop("first_name", "")
                last_name = mapped.pop("last_name", "")
                job_title = mapped.pop("job_title", None)
                phone = mapped.pop("phone", None)

                # Skip if no usable identifier
                if not email and not linkedin_url:
                    skipped += 1
                    continue

                # Find or create company
                company_id = None
                if company_name:
                    domain = mapped.pop("domain", None)
                    result = await db.execute(
                        select(Company).where(
                            Company.workspace_id == ws_uuid,
                            Company.name == company_name,
                            Company.deleted_at.is_(None),
                        )
                    )
                    company = result.scalar_one_or_none()
                    if not company:
                        company = Company(
                            workspace_id=ws_uuid,
                            name=company_name,
                            domain=domain or None,
                            source="csv_import",
                        )
                        db.add(company)
                        await db.flush()
                    company_id = company.id

                # Dedup contact on email within workspace
                contact_id = None
                if email:
                    result = await db.execute(
                        select(Contact).where(
                            Contact.workspace_id == ws_uuid,
                            Contact.email == email,
                            Contact.deleted_at.is_(None),
                        )
                    )
                    contact = result.scalar_one_or_none()
                    if not contact:
                        contact = Contact(
                            workspace_id=ws_uuid,
                            company_id=company_id,
                            email=email,
                            first_name=first_name,
                            last_name=last_name,
                            job_title=job_title,
                            phone=phone,
                            linkedin_url=linkedin_url,
                        )
                        db.add(contact)
                        await db.flush()
                    contact_id = contact.id

                # Dedup lead on (workspace, contact)
                if contact_id:
                    result = await db.execute(
                        select(Lead).where(
                            Lead.workspace_id == ws_uuid,
                            Lead.contact_id == contact_id,
                            Lead.deleted_at.is_(None),
                        )
                    )
                    if result.scalar_one_or_none():
                        skipped += 1
                        continue

                lead = Lead(
                    workspace_id=ws_uuid,
                    company_id=company_id,
                    contact_id=contact_id,
                    owner_id=owner_uuid,
                    source="csv_import",
                    extra={"raw_row": row, "import_job_id": job_id},
                )
                batch.append(lead)
                processed += 1

                if len(batch) >= BATCH_SIZE:
                    db.add_all(batch)
                    await db.commit()
                    batch = []
                    await redis.hset(status_key, mapping={"processed": processed})  # type: ignore[arg-type]

            except Exception as e:
                errors.append({"row": i + 1, "error": str(e)})
                logger.warning("Import row %d error: %s", i + 1, e)

        if batch:
            db.add_all(batch)
            await db.commit()

    result_data = {
        "status": "completed",
        "total": total,
        "processed": processed,
        "skipped": skipped,
        "errors": len(errors),
    }
    await redis.hset(status_key, mapping={k: str(v) for k, v in result_data.items()})  # type: ignore[arg-type]
    await redis.expire(status_key, 86400)  # keep job status for 24h

    logger.info("Import job %s: processed=%d skipped=%d errors=%d", job_id, processed, skipped, len(errors))
    return result_data
