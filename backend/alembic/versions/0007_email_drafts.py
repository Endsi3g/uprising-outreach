"""email drafts

Revision ID: 0007
Revises: 0006
Create Date: 2026-04-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "email_drafts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "workspace_id",
            UUID(as_uuid=True),
            sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "lead_id",
            UUID(as_uuid=True),
            sa.ForeignKey("leads.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_email_drafts_workspace_id", "email_drafts", ["workspace_id"])
    op.create_index("ix_email_drafts_lead_id", "email_drafts", ["lead_id"])


def downgrade() -> None:
    op.drop_index("ix_email_drafts_lead_id", table_name="email_drafts")
    op.drop_index("ix_email_drafts_workspace_id", table_name="email_drafts")
    op.drop_table("email_drafts")
