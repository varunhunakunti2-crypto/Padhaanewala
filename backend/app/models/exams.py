from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Integer, UniqueConstraint, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin

class Exam(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    level: Mapped[str | None] = mapped_column(String, nullable=True) # e.g., National, State
    conducting_authority: Mapped[str | None] = mapped_column(String, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_website: Mapped[str | None] = mapped_column(String, nullable=True)
    official_notification_url: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    
    dates: Mapped[List["ExamDate"]] = relationship(back_populates="exam")

class ExamDate(UUIDMixin, TimestampMixin, ScrapedDataMixin, Base):
    exam_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exams.id", ondelete="CASCADE"))
    session_year: Mapped[int] = mapped_column(Integer)
    event_name: Mapped[str] = mapped_column(String) # e.g., Registration Start, Exam Date
    event_date: Mapped[str | None] = mapped_column(String, nullable=True) # Could be Date if exact, or str if tentative
    
    exam: Mapped["Exam"] = relationship(back_populates="dates")

    __table_args__ = (
        UniqueConstraint('exam_id', 'session_year', 'event_name', name='uix_exam_date_event'),
    )
