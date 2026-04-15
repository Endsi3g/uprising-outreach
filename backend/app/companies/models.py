from sqlalchemy import Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.models import WorkspaceScopedModel


class Company(WorkspaceScopedModel):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    estimated_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="company")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="company")

    __table_args__ = (
        Index("ix_companies_workspace_domain", "workspace_id", "domain"),
        Index("ix_companies_workspace_created", "workspace_id", "created_at"),
    )
