from typing import List, Optional
from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Permission(UUIDMixin, TimestampMixin, Base):
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

class Role(UUIDMixin, TimestampMixin, Base):
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)

    permissions: Mapped[List["Permission"]] = relationship(secondary="role_permissions")
    users: Mapped[List["User"]] = relationship(secondary="user_roles", back_populates="roles")

class RolePermission(TimestampMixin, Base):
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    permission_id: Mapped[str] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)

class UserRole(TimestampMixin, Base):
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class User(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_verified: Mapped[bool] = mapped_column(default=False)

    roles: Mapped[List["Role"]] = relationship(secondary="user_roles", back_populates="users")
    
    # Relationships to be defined later
    # student: Mapped[Optional["Student"]] = relationship(back_populates="user")
    # counsellor: Mapped[Optional["Counsellor"]] = relationship(back_populates="user")
