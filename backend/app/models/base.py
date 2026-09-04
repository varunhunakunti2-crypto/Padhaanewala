from datetime import datetime
import uuid
import re
from typing import Any

from sqlalchemy import DateTime, text
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

def camel_to_snake(name: str) -> str:
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

class Base(DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        snake_name = camel_to_snake(cls.__name__)
        if snake_name.endswith('s'):
            return snake_name
        elif snake_name.endswith('y'):
            return snake_name[:-1] + 'ies'
        return snake_name + "s"

class UUIDMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        primary_key=True, 
        server_default=text("uuid_generate_v4()"), 
        index=True
    )

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )

class ScrapedDataMixin:
    source_url: Mapped[str | None] = mapped_column(nullable=True)
    source_name: Mapped[str | None] = mapped_column(nullable=True)
    verification_status: Mapped[str | None] = mapped_column(nullable=True) # Could be enum
    last_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
