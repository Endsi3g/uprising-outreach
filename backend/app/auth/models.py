import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.shared.models import TimestampMixin, WorkspaceScopedModel


class Role(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    SDR = "sdr"
    CLOSER = "closer"
    VIEWER = "viewer"


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"
    REVIEWER = "reviewer"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    role: Mapped[Role] = mapped_column(
        Enum(Role, name="user_role"), nullable=False, default=Role.SDR
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="users")


class Invitation(WorkspaceScopedModel):
    __tablename__ = "invitations"

    email: Mapped[str] = mapped_column(String(320), nullable=False)
    role: Mapped[Role] = mapped_column(
        Enum(Role, name="role"), nullable=False, default=Role.SDR
    )
    token: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    status: Mapped[InvitationStatus] = mapped_column(
        Enum(InvitationStatus, name="invitation_status"),
        nullable=False,
        default=InvitationStatus.PENDING,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    invited_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    invited_by: Mapped["User"] = relationship("User")
