"""companies and contacts

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-13
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Companies ─────────────────────────────────────────────────────────────
    op.create_table(
        "companies",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("domain", sa.String(255), nullable=True),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("country", sa.String(100), nullable=True),
        sa.Column("estimated_size", sa.String(50), nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("metadata", JSONB, nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_companies_workspace_id", "companies", ["workspace_id"])
    op.create_index("ix_companies_domain", "companies", ["domain"])
    op.create_index("ix_companies_workspace_domain", "companies", ["workspace_id", "domain"])
    op.create_index("ix_companies_workspace_created", "companies", ["workspace_id", "created_at"])

    # ── Verification status enum ───────────────────────────────────────────────
    verification_status = sa.Enum(
        "unverified", "pending", "verified", "invalid", "risky",
        name="verification_status"
    )
    verification_status.create(op.get_bind())

    # ── Contacts ──────────────────────────────────────────────────────────────
    op.create_table(
        "contacts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workspace_id", UUID(as_uuid=True), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False),
        sa.Column("company_id", UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("first_name", sa.String(100), nullable=False, server_default=""),
        sa.Column("last_name", sa.String(100), nullable=False, server_default=""),
        sa.Column("job_title", sa.String(200), nullable=True),
        sa.Column("email", sa.String(320), nullable=True),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("linkedin_url", sa.String(500), nullable=True),
        sa.Column("verification_status", sa.Enum("unverified", "pending", "verified", "invalid", "risky", name="verification_status"), nullable=False, server_default="unverified"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_contacts_workspace_id", "contacts", ["workspace_id"])
    op.create_index("ix_contacts_company_id", "contacts", ["company_id"])
    op.create_index("ix_contacts_workspace_email", "contacts", ["workspace_id", "email"])
    op.create_index("ix_contacts_workspace_company", "contacts", ["workspace_id", "company_id"])
    op.create_index("ix_contacts_workspace_created", "contacts", ["workspace_id", "created_at"])


def downgrade() -> None:
    op.drop_table("contacts")
    op.execute("DROP TYPE IF EXISTS verification_status")
    op.drop_table("companies")
