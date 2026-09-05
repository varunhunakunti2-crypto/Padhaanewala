from datetime import date
from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Integer, Float, Text, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin

class Scholarship(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_name: Mapped[str] = mapped_column(String)
    is_government: Mapped[bool] = mapped_column(Boolean, default=False)  # True = govt scheme, False = private
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    eligibility_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    income_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    documents: Mapped[str | None] = mapped_column(Text, nullable=True)
    application_procedure: Mapped[str | None] = mapped_column(Text, nullable=True)
    official_application_url: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active", index=True)  # active / expired / draft

    courses: Mapped[List["Course"]] = relationship(
        secondary="scholarship_courses", back_populates="scholarships"
    )

class ScholarshipCourse(TimestampMixin, Base):
    scholarship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)

class ScholarshipState(TimestampMixin, Base):
    scholarship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
    state: Mapped[str] = mapped_column(String, primary_key=True, index=True) # Could link to location.id, but state is often just a string.