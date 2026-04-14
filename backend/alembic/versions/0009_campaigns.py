"""campaigns — execution engine tables

Revision ID: 0009
Revises: 0008
Create Date: 2026-04-14
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enum types ────────────────────────────────────────────────────────────
    op.execute("CREATE TYPE campaign_status AS ENUM ('draft','active','paused','completed','archived')")
    op.execute("CREATE TYPE campaign_step_type AS ENUM ('email','wait')")
    op.execute("CREATE TYPE campaign_lead_status AS ENUM ('enrolled','active','completed','unsubscribed','bounced','error')")
    op.execute("CREATE TYPE scheduled_send_status AS ENUM ('pending','sent','failed','skipped')")

    # ── campaigns ─────────────────────────────────────────────────────────────
    op.create_table(
        "campaigns",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_account_id", UUID(as_uuid=True), sa.ForeignKey("sender_accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.Enum("draft", "active", "paused", "completed", "archived", name="campaign_status"), nullable=False, server_default="draft"),
        sa.Column("leads_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("sent_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("reply_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("open_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_campaigns_workspace", "campaigns", ["workspace_id"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    # ── campaign_steps ────────────────────────────────────────────────────────
    op.create_table(
        "campaign_steps",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
        sa.Column("step_type", sa.Enum("email", "wait", name="campaign_step_type"), nullable=False, server_default="email"),
        sa.Column("subject", sa.String(500), nullable=True),
        sa.Column("body_html", sa.Text, nullable=True),
        sa.Column("body_text", sa.Text, nullable=True),
        sa.Column("delay_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("delay_hours", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_campaign_steps_campaign", "campaign_steps", ["campaign_id"])

    # ── campaign_leads ────────────────────────────────────────────────────────
    op.create_table(
        "campaign_leads",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lead_id", UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("workspace_id", UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.Enum("enrolled", "active", "completed", "unsubscribed", "bounced", "error", name="campaign_lead_status"), nullable=False, server_default="enrolled"),
        sa.Column("current_step", sa.Integer, nullable=False, server_default="0"),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_campaign_leads_campaign", "campaign_leads", ["campaign_id"])
    op.create_index("ix_campaign_leads_lead", "campaign_leads", ["lead_id"])
    op.create_index("ix_campaign_leads_workspace", "campaign_leads", ["workspace_id"])
    op.create_unique_constraint("uq_campaign_leads_pair", "campaign_leads", ["campaign_id", "lead_id"])

    # ── scheduled_sends ───────────────────────────────────────────────────────
    op.create_table(
        "scheduled_sends",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_lead_id", UUID(as_uuid=True), sa.ForeignKey("campaign_leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("step_id", UUID(as_uuid=True), sa.ForeignKey("campaign_steps.id", ondelete="CASCADE"), nullable=False),
        sa.Column("lead_id", UUID(as_uuid=True), nullable=False),
        sa.Column("workspace_id", UUID(as_uuid=True), nullable=False),
        sa.Column("sender_account_id", UUID(as_uuid=True), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Enum("pending", "sent", "failed", "skipped", name="scheduled_send_status"), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("external_message_id", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_scheduled_sends_campaign", "scheduled_sends", ["campaign_id"])
    op.create_index("ix_scheduled_sends_status", "scheduled_sends", ["status"])
    op.create_index("ix_scheduled_sends_lead", "scheduled_sends", ["lead_id"])


def downgrade() -> None:
    op.drop_table("scheduled_sends")
    op.drop_table("campaign_leads")
    op.drop_table("campaign_steps")
    op.drop_table("campaigns")
    op.execute("DROP TYPE IF EXISTS scheduled_send_status")
    op.execute("DROP TYPE IF EXISTS campaign_lead_status")
    op.execute("DROP TYPE IF EXISTS campaign_step_type")
    op.execute("DROP TYPE IF EXISTS campaign_status")
