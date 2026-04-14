"""sender accounts

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    email_provider = sa.Enum("gmail", "outlook", "smtp", name="email_provider")
    email_provider.create(op.get_bind())

    sender_status = sa.Enum("pending", "active", "paused", "error", "disconnected", name="sender_status")
    sender_status.create(op.get_bind())

    op.create_table(
        "sender_accounts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("email_address", sa.String(320), nullable=False),
        sa.Column("display_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("provider", sa.Enum("gmail", "outlook", "smtp", name="email_provider"), nullable=False, server_default="gmail"),
        sa.Column("status", sa.Enum("pending", "active", "paused", "error", "disconnected", name="sender_status"), nullable=False, server_default="pending"),
        sa.Column("oauth_access_token", sa.Text, nullable=True),
        sa.Column("oauth_refresh_token", sa.Text, nullable=True),
        sa.Column("oauth_token_expires_at", sa.String(50), nullable=True),
        sa.Column("oauth_scopes", sa.String(500), nullable=True),
        sa.Column("spf_valid", sa.Boolean, nullable=True),
        sa.Column("dkim_valid", sa.Boolean, nullable=True),
        sa.Column("dmarc_policy", sa.String(50), nullable=True),
        sa.Column("dns_status", JSONB, nullable=True),
        sa.Column("dns_verified_at", sa.String(50), nullable=True),
        sa.Column("daily_send_limit", sa.Integer, nullable=False, server_default="100"),
        sa.Column("warmup_status", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_sender_accounts_workspace_id", "sender_accounts", ["workspace_id"])
    op.create_index("ix_sender_accounts_email", "sender_accounts", ["email_address"])


def downgrade() -> None:
    op.drop_table("sender_accounts")
    op.execute("DROP TYPE IF EXISTS sender_status")
    op.execute("DROP TYPE IF EXISTS email_provider")
