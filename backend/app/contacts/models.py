import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.models import WorkspaceScopedModel


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    INVALID = "invalid"
    RISKY = "risky"


class Contact(WorkspaceScopedModel):
    __tablename__ = "contacts"

    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    job_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status"),
        nullable=False,
        default=VerificationStatus.UNVERIFIED,
    )

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="contacts")
    leads: Mapped[list["Lead"]] = relationship("Lead", back_populates="contact")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    __table_args__ = (
        Index("ix_contacts_workspace_email", "workspace_id", "email"),
        Index("ix_contacts_workspace_company", "workspace_id", "company_id"),
        Index("ix_contacts_workspace_created", "workspace_id", "created_at"),
    )
