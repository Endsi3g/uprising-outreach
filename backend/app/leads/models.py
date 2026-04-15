import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.models import WorkspaceScopedModel


class LeadStatus(str, enum.Enum):
    RAW = "raw"
    ENRICHING = "enriching"
    ENRICHED = "enriched"
    SCORED = "scored"
    IN_SEQUENCE = "in_sequence"
    REPLIED = "replied"
    CONVERTED = "converted"
    SUPPRESSED = "suppressed"


class LeadTemperature(str, enum.Enum):
    COLD = "cold"
    WARM = "warm"
    HOT = "hot"


class Lead(WorkspaceScopedModel):
    __tablename__ = "leads"

    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status"),
        nullable=False,
        default=LeadStatus.RAW,
        index=True,
    )
    temperature: Mapped[LeadTemperature] = mapped_column(
        Enum(LeadTemperature, name="lead_temperature"),
        nullable=False,
        default=LeadTemperature.COLD,
    )
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    enrichment_status: Mapped[str | None] = mapped_column(String(50), nullable=True)
    next_action: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # Store import metadata and custom fields
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    active_campaign_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="SET NULL"),
        nullable=True,
    )
    extra: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="leads", lazy="selectin")
    contact: Mapped["Contact"] = relationship("Contact", back_populates="leads", lazy="selectin")
    owner: Mapped["User"] = relationship("User", back_populates="leads", lazy="selectin")
    active_campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="leads")

    __table_args__ = (
        Index("ix_leads_workspace_status", "workspace_id", "status"),
        Index("ix_leads_workspace_created", "workspace_id", "created_at"),
        Index(
            "ix_leads_workspace_score",
            "workspace_id",
            "score",
            postgresql_where="score IS NOT NULL",
        ),
        Index("ix_leads_workspace_owner", "workspace_id", "owner_id"),
    )


class ActivityLog(WorkspaceScopedModel):
    __tablename__ = "activity_log"

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    __table_args__ = (
        Index("ix_activity_workspace_entity", "workspace_id", "entity_id", "created_at"),
        Index("ix_activity_workspace_event", "workspace_id", "event_type", "created_at"),
    )


class SuppressionEntry(WorkspaceScopedModel):
    __tablename__ = "suppression_entries"

    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    reason: Mapped[str] = mapped_column(String(50), nullable=False)  # unsubscribe|bounce|complaint

    __table_args__ = (
        Index("ix_suppression_workspace_email", "workspace_id", "email", unique=True),
    )
