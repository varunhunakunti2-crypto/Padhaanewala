from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Counsellor(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # user: Mapped["User"] = relationship(back_populates="counsellor")
    leads: Mapped[List["Lead"]] = relationship(back_populates="counsellor")

class Lead(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str | None] = mapped_column(String, index=True, nullable=True)
    phone: Mapped[str] = mapped_column(String, index=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    interested_course_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("counsellors.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="new", index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True) # Keeping for simple one-liner, detailed in LeadNote
    
    counsellor: Mapped["Counsellor"] = relationship(back_populates="leads")
    status_history: Mapped[List["LeadStatusHistory"]] = relationship(back_populates="lead", cascade="all, delete-orphan")

class LeadStatusHistory(UUIDMixin, TimestampMixin, Base):
    lead_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"))
    old_status: Mapped[str | None] = mapped_column(String, nullable=True)
    new_status: Mapped[str] = mapped_column(String)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    lead: Mapped["Lead"] = relationship(back_populates="status_history")

class LeadNote(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lead_notes"
    
    lead_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"))
    counsellor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("counsellors.id", ondelete="SET NULL"), nullable=True)
    note: Mapped[str] = mapped_column(Text)

class LeadFollowup(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lead_followups"
    
    lead_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"))
    counsellor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("counsellors.id", ondelete="SET NULL"), nullable=True)
    scheduled_at: Mapped[str | None] = mapped_column(String, nullable=True) # Use DateTime in production
    status: Mapped[str] = mapped_column(String, default="pending")
    outcome: Mapped[str | None] = mapped_column(Text, nullable=True)

class Enquiry(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "enquiries"
    
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    subject: Mapped[str | None] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default="new")
