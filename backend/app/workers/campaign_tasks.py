"""Campaign execution ARQ tasks."""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime, timedelta

logger = logging.getLogger(__name__)


async def execute_campaign_step(ctx: dict, scheduled_send_id: str) -> dict:
    """
    Execute a single scheduled campaign email send.

    Flow:
    1. Load ScheduledSend — skip if already sent/failed
    2. Load step, campaign_lead, lead, contact, sender_account
    3. Send email via email_client.send_email
    4. Mark ScheduledSend as sent
    5. Advance CampaignLead to next step (schedule it)
    6. If no more steps → mark CampaignLead as completed
    """
    from sqlalchemy import select

    from app.campaigns.models import (
        Campaign,
        CampaignLead,
        CampaignLeadStatus,
        CampaignStep,
        CampaignStepType,
        ScheduledSend,
        ScheduledSendStatus,
    )
    from app.contacts.models import Contact
    from app.database import AsyncSessionLocal
    from app.leads.models import Lead
    from app.senders.email_client import send_email
    from app.senders.models import SenderAccount

    async with AsyncSessionLocal() as db:
        # Load ScheduledSend
        result = await db.execute(
            select(ScheduledSend).where(ScheduledSend.id == uuid.UUID(scheduled_send_id))
        )
        send = result.scalar_one_or_none()
        if not send:
            logger.error("execute_campaign_step: ScheduledSend %s not found", scheduled_send_id)
            return {"error": "not_found"}

        if send.status != ScheduledSendStatus.PENDING:
            logger.info("execute_campaign_step: %s already %s — skip", scheduled_send_id, send.status)
            return {"status": "skipped", "reason": send.status}

        # Load step
        step_result = await db.execute(select(CampaignStep).where(CampaignStep.id == send.step_id))
        step = step_result.scalar_one_or_none()
        if not step or step.step_type != CampaignStepType.EMAIL:
            send.status = ScheduledSendStatus.SKIPPED
            await db.commit()
            return {"status": "skipped", "reason": "not_email_step"}

        # Load campaign_lead
        cl_result = await db.execute(
            select(CampaignLead).where(CampaignLead.id == send.campaign_lead_id)
        )
        campaign_lead = cl_result.scalar_one_or_none()
        if not campaign_lead or campaign_lead.status in (
            CampaignLeadStatus.UNSUBSCRIBED,
            CampaignLeadStatus.BOUNCED,
            CampaignLeadStatus.ERROR,
        ):
            send.status = ScheduledSendStatus.SKIPPED
            await db.commit()
            return {"status": "skipped", "reason": "lead_inactive"}

        # Load lead + contact
        lead_result = await db.execute(select(Lead).where(Lead.id == send.lead_id))
        lead = lead_result.scalar_one_or_none()
        if not lead:
            send.status = ScheduledSendStatus.FAILED
            send.error_message = "Lead not found"
            await db.commit()
            return {"error": "lead_not_found"}

        to_email: str | None = None
        first_name = ""
        if lead.contact_id:
            contact_result = await db.execute(
                select(Contact).where(Contact.id == lead.contact_id)
            )
            contact = contact_result.scalar_one_or_none()
            if contact:
                to_email = contact.email
                first_name = contact.first_name or ""

        if not to_email:
            send.status = ScheduledSendStatus.FAILED
            send.error_message = "No email address on contact"
            await db.commit()
            return {"error": "no_email"}

        # Load sender account
        if not send.sender_account_id:
            send.status = ScheduledSendStatus.FAILED
            send.error_message = "No sender account configured"
            await db.commit()
            return {"error": "no_sender"}

        sender_result = await db.execute(
            select(SenderAccount).where(SenderAccount.id == send.sender_account_id)
        )
        sender = sender_result.scalar_one_or_none()
        if not sender:
            send.status = ScheduledSendStatus.FAILED
            send.error_message = "Sender account not found"
            await db.commit()
            return {"error": "sender_not_found"}

        # Personalise subject / body
        subject = (step.subject or "").replace("{{first_name}}", first_name)
        body_html = (step.body_html or "").replace("{{first_name}}", first_name)
        body_text = (step.body_text or "").replace("{{first_name}}", first_name) or None

        # Send
        try:
            ext_id = await send_email(db, sender, to_email, subject, body_html, body_text)
            send.status = ScheduledSendStatus.SENT
            send.sent_at = datetime.now(UTC)
            send.external_message_id = ext_id

            # Update campaign stats
            campaign_result = await db.execute(
                select(Campaign).where(Campaign.id == send.campaign_id)
            )
            campaign = campaign_result.scalar_one_or_none()
            if campaign:
                campaign.sent_count = campaign.sent_count + 1

        except Exception as exc:
            logger.error("Campaign send failed for lead %s: %s", send.lead_id, exc)
            send.status = ScheduledSendStatus.FAILED
            send.error_message = str(exc)
            campaign_lead.status = CampaignLeadStatus.ERROR
            await db.commit()
            return {"error": str(exc)}

        # Advance to the next step
        all_steps_result = await db.execute(
            select(CampaignStep)
            .where(CampaignStep.campaign_id == send.campaign_id)
            .order_by(CampaignStep.position)
        )
        all_steps = list(all_steps_result.scalars().all())
        next_steps = [s for s in all_steps if s.position > step.position]

        if next_steps:
            next_step = next_steps[0]
            campaign_lead.current_step = next_step.position

            now = datetime.now(UTC)
            delay = timedelta(days=next_step.delay_days, hours=next_step.delay_hours)
            next_scheduled_at = now + delay

            next_send = ScheduledSend(
                campaign_id=send.campaign_id,
                campaign_lead_id=campaign_lead.id,
                step_id=next_step.id,
                lead_id=send.lead_id,
                workspace_id=send.workspace_id,
                sender_account_id=send.sender_account_id,
                scheduled_at=next_scheduled_at,
            )
            db.add(next_send)
            await db.flush()

            # Enqueue next step
            from arq import create_pool
            from arq.connections import RedisSettings
            from app.config import settings

            defer_secs = max(0, int(delay.total_seconds()))
            redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
            await redis.enqueue_job(
                "execute_campaign_step",
                str(next_send.id),
                _defer_by=timedelta(seconds=defer_secs) if defer_secs else None,
                _queue_name="outreach:default",
            )
            await redis.aclose()
        else:
            # All steps done
            campaign_lead.status = CampaignLeadStatus.COMPLETED
            campaign_lead.completed_at = datetime.now(UTC)

        await db.commit()

    logger.info(
        "execute_campaign_step(%s): sent to %s — ext_id=%s",
        scheduled_send_id, to_email, send.external_message_id,
    )
    return {"status": "sent", "to": to_email, "external_message_id": send.external_message_id}
