from sqlalchemy import String, Boolean, JSON, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.shared.models import TimestampMixin
import uuid

class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    trigger: Mapped[str] = mapped_column(String(100))
    author: Mapped[str] = mapped_column(String(100), default="Vous")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Connector(Base, TimestampMixin):
    __tablename__ = "connectors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    provider: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="Connected")
    icon: Mapped[str] = mapped_column(String(50), nullable=True)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
