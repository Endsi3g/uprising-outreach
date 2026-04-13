"""leads, activity log, and suppression entries

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enums ─────────────────────────────────────────────────────────────────
    lead_status = sa.Enum(
        "raw", "enriching", "enriched", "scored", "in_sequence",
        "replied", "converted", "suppressed",
        name="lead_status"
    )
    lead_status.create(op.get_bind())

    lead_temperature = sa.Enum("cold", "warm", "hot", name="lead_temperature")
    lead_temperature.create(op.get_bind())

    # ── Leads ─────────────────────────────────────────────────────────────────
    op.create_table(
        "leads",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("contact_id", UUID(as_uuid=True), sa.ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("owner_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.Enum("raw", "enriching", "enriched", "scored", "in_sequence", "replied", "converted", "suppressed", name="lead_status"), nullable=False, server_default="raw"),
        sa.Column("temperature", sa.Enum("cold", "warm", "hot", name="lead_temperature"), nullable=False, server_default="cold"),
        sa.Column("score", sa.Integer, nullable=True),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("enrichment_status", sa.String(50), nullable=True),
        sa.Column("next_action", sa.String(200), nullable=True),
        sa.Column("extra", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_leads_workspace_id", "leads", ["workspace_id"])
    op.create_index("ix_leads_workspace_status", "leads", ["workspace_id", "status"])
    op.create_index("ix_leads_workspace_created", "leads", ["workspace_id", "created_at"])
    op.create_index("ix_leads_workspace_owner", "leads", ["workspace_id", "owner_id"])
    op.execute(
        "CREATE INDEX ix_leads_workspace_score ON leads (workspace_id, score) WHERE score IS NOT NULL"
    )

    # Enable Row Level Security for multi-tenancy defense-in-depth
    op.execute("ALTER TABLE leads ENABLE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY workspace_isolation ON leads "
        "USING (workspace_id = current_setting('app.workspace_id', true)::uuid)"
    )

    # ── Activity Log ──────────────────────────────────────────────────────────
    op.create_table(
        "activity_log",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=False),
        sa.Column("actor_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("payload", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_activity_workspace_id", "activity_log", ["workspace_id"])
    op.create_index("ix_activity_event_type", "activity_log", ["event_type"])
    op.create_index("ix_activity_workspace_entity", "activity_log", ["workspace_id", "entity_id", "created_at"])
    op.create_index("ix_activity_workspace_event", "activity_log", ["workspace_id", "event_type", "created_at"])

    # ── Suppression Entries ────────────────────────────────────────────────────
    op.create_table(
        "suppression_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("reason", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_suppression_workspace_id", "suppression_entries", ["workspace_id"])
    op.create_index("ix_suppression_workspace_email", "suppression_entries", ["workspace_id", "email"], unique=True)


def downgrade() -> None:
    op.drop_table("suppression_entries")
    op.drop_table("activity_log")
    op.execute("DROP POLICY IF EXISTS workspace_isolation ON leads")
    op.execute("ALTER TABLE leads DISABLE ROW LEVEL SECURITY")
    op.drop_table("leads")
    op.execute("DROP TYPE IF EXISTS lead_temperature")
    op.execute("DROP TYPE IF EXISTS lead_status")
