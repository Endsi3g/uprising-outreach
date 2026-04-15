"""campaigns

Revision ID: 0005
Revises: 0004
Create Date: 2026-04-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enums
    campaign_status = sa.Enum("draft", "active", "paused", "completed", "archived", name="campaign_status")
    campaign_status.create(op.get_bind())

    campaign_step_type = sa.Enum("email", "wait", "linkedin_message", "linkedin_connect", name="campaign_step_type")
    campaign_step_type.create(op.get_bind())

    # Campaign table
    op.create_table(
        "campaigns",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("status", sa.Enum("draft", "active", "paused", "completed", "archived", name="campaign_status"), nullable=False, server_default="draft"),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_campaigns_workspace_id", "campaigns", ["workspace_id"])

    # Campaign Step table
    op.create_table(
        "campaign_steps",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("order", sa.Integer, nullable=False, server_default="1"),
        sa.Column("step_type", sa.Enum("email", "wait", "linkedin_message", "linkedin_connect", name="campaign_step_type"), nullable=False, server_default="email"),
        sa.Column("subject", sa.String(200), nullable=True),
        sa.Column("template", sa.Text, nullable=True),
        sa.Column("wait_days", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_campaign_steps_workspace_id", "campaign_steps", ["workspace_id"])
    op.create_index("ix_campaign_steps_campaign_id", "campaign_steps", ["campaign_id"])

    # Update Lead table
    op.add_column("leads", sa.Column("active_campaign_id", UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True))
    op.add_column("leads", sa.Column("score", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("leads", "score")
    op.drop_column("leads", "active_campaign_id")
    op.drop_table("campaign_steps")
    op.drop_table("campaigns")
    op.execute("DROP TYPE IF EXISTS campaign_step_type")
    op.execute("DROP TYPE IF EXISTS campaign_status")
