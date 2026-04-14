"""inbox conversations and messages

Revision ID: 0007
Revises: 0006
Create Date: 2026-04-13
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
        "inbox_conversations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_account_id", UUID(as_uuid=True), sa.ForeignKey("sender_accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("contact_id", UUID(as_uuid=True), sa.ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("lead_id", UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.String(20), nullable=False, server_default="gmail"),
        sa.Column("external_thread_id", sa.String(500), nullable=True),
        sa.Column("subject", sa.String(500), nullable=False, server_default=""),
        sa.Column("participant_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("participant_email", sa.String(320), nullable=False, server_default=""),
        sa.Column("status", sa.String(30), nullable=False, server_default="open"),
        sa.Column("classification", sa.String(50), nullable=False, server_default="UNCLASSIFIED"),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_inbox_conversations_workspace", "inbox_conversations", ["workspace_id"])
    op.create_index("ix_inbox_conversations_sender", "inbox_conversations", ["sender_account_id"])
    op.create_index("ix_inbox_conversations_thread", "inbox_conversations", ["workspace_id", "external_thread_id"], unique=True)

    op.create_table(
        "inbox_messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", UUID(as_uuid=True), sa.ForeignKey("inbox_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),  # inbound | outbound
        sa.Column("sender_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("sender_email", sa.String(320), nullable=False, server_default=""),
        sa.Column("body_text", sa.Text, nullable=False, server_default=""),
        sa.Column("external_message_id", sa.String(500), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_inbox_messages_conversation", "inbox_messages", ["conversation_id"])
    op.create_unique_constraint("uq_inbox_messages_external_id", "inbox_messages", ["external_message_id"])


def downgrade() -> None:
    op.drop_table("inbox_messages")
    op.drop_table("inbox_conversations")
