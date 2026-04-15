import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.models import WorkspaceScopedModel


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Campaign(WorkspaceScopedModel):
    __tablename__ = "campaigns"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus, name="campaign_status"),
        nullable=False,
        default=CampaignStatus.DRAFT,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    steps: Mapped[list["CampaignStep"]] = relationship("CampaignStep", back_populates="campaign", cascade="all, delete-orphan", order_by="CampaignStep.order")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="active_campaign")


class CampaignStepType(str, enum.Enum):
    EMAIL = "email"
    WAIT = "wait"
    LINKEDIN_MESSAGE = "linkedin_message"
    LINKEDIN_CONNECT = "linkedin_connect"


class CampaignStep(WorkspaceScopedModel):
    __tablename__ = "campaign_steps"

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False
    )
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    step_type: Mapped[CampaignStepType] = mapped_column(
        Enum(CampaignStepType, name="campaign_step_type"),
        nullable=False,
        default=CampaignStepType.EMAIL,
    )
    
    # For EMAIL type
    subject: Mapped[str | None] = mapped_column(String(200), nullable=True)
    template: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # For WAIT type
    wait_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Relationships
    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="steps")
