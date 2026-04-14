"""add facebook to email_provider enum

Revision ID: 0008
Revises: 0007
Create Date: 2026-04-13
"""

from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL ALTER TYPE … ADD VALUE cannot run inside a transaction block.
    # execute() with execution_options bypasses the implicit transaction.
    op.execute("ALTER TYPE email_provider ADD VALUE IF NOT EXISTS 'facebook'")


def downgrade() -> None:
    # Postgres does not support removing enum values — downgrade is a no-op.
    # To fully revert, drop and recreate the type (destructive — not done here).
    pass
