from sqlalchemy import Column, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import Base

user_permissions = Table(
    "user_permissions",
    Base.metadata,
    Column("role_id", ForeignKey("roles.id"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id"), primary_key=True)
)

class User(Base):
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role_id = Column(ForeignKey("roles.id"), nullable=True)

    role = relationship("Role", back_populates="users")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    counsellor_profile = relationship("Counsellor", back_populates="user", uselist=False)

class Role(Base):
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=user_permissions, back_populates="roles")

class Permission(Base):
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    roles = relationship("Role", secondary=user_permissions, back_populates="permissions")
