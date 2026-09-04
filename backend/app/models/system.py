from typing import Optional
import uuid
from sqlalchemy import String, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Location(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    state: Mapped[str] = mapped_column(String, index=True)
    city: Mapped[str] = mapped_column(String, index=True)
    pincode: Mapped[str | None] = mapped_column(String, index=True, nullable=True)

class Media(UUIDMixin, TimestampMixin, Base):
    url: Mapped[str] = mapped_column(String)
    alt_text: Mapped[str | None] = mapped_column(String, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String, nullable=True)
    size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    storage_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    reference_id: Mapped[uuid.UUID | None] = mapped_column(index=True, nullable=True)

class AuditLog(UUIDMixin, TimestampMixin, Base):
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String, nullable=False)
    entity_type: Mapped[str] = mapped_column(String, nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String, nullable=True)
    changes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

class Notification(UUIDMixin, TimestampMixin, Base):
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(default=False)
