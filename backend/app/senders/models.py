import enum
import uuid

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.models import WorkspaceScopedModel


class EmailProvider(str, enum.Enum):
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    SMTP = "smtp"
    FACEBOOK = "facebook"


class SenderStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"
    DISCONNECTED = "disconnected"


class SenderAccount(WorkspaceScopedModel):
    __tablename__ = "sender_accounts"

    email_address: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    provider: Mapped[EmailProvider] = mapped_column(
        Enum(EmailProvider, name="email_provider"),
        nullable=False,
        default=EmailProvider.GMAIL,
    )
    status: Mapped[SenderStatus] = mapped_column(
        Enum(SenderStatus, name="sender_status"),
        nullable=False,
        default=SenderStatus.PENDING,
    )

    # OAuth tokens — stored encrypted
    oauth_access_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    oauth_refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    oauth_token_expires_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
    oauth_scopes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # DNS / deliverability health
    spf_valid: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    dkim_valid: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    dmarc_policy: Mapped[str | None] = mapped_column(String(50), nullable=True)
    dns_status: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    dns_verified_at: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Send limits
    daily_send_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    warmup_status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    @property
    def dns_fully_valid(self) -> bool:
        return bool(self.spf_valid and self.dkim_valid and self.dmarc_policy in ("quarantine", "reject", "none"))
