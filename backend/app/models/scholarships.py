from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin

class Scholarship(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_name: Mapped[str] = mapped_column(String)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    eligibility_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)

class ScholarshipCourse(TimestampMixin, Base):
    scholarship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)

class ScholarshipState(TimestampMixin, Base):
    scholarship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
    state: Mapped[str] = mapped_column(String, primary_key=True, index=True) # Could link to location.id, but state is often just a string.
