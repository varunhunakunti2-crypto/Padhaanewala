from typing import List, Optional
import uuid
from sqlalchemy import String, Integer, ForeignKey, Float, Text, Boolean, UniqueConstraint, CheckConstraint, ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import TSVECTOR

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin

class University(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    
    colleges: Mapped[List["College"]] = relationship(back_populates="university")

class College(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    college_code: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    university_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("universities.id", ondelete="SET NULL"), nullable=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)
    
    university: Mapped[Optional["University"]] = relationship(back_populates="colleges")
    courses: Mapped[List["Course"]] = relationship(secondary="college_courses", back_populates="colleges")
    facilities: Mapped[List["Facility"]] = relationship(secondary="college_facilities")

class Course(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    level: Mapped[str | None] = mapped_column(String) # e.g., UG, PG
    
    colleges: Mapped[List["College"]] = relationship(secondary="college_courses", back_populates="courses")

class CollegeCourse(TimestampMixin, ScrapedDataMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    fees: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intake: Mapped[int | None] = mapped_column(Integer, nullable=True)

class Facility(UUIDMixin, TimestampMixin, Base):
    name: Mapped[str] = mapped_column(String, unique=True, index=True)

class CollegeFacility(TimestampMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True)
    facility_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("facilities.id", ondelete="CASCADE"), primary_key=True)

class Admission(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"))
    process_details: Mapped[str] = mapped_column(Text)
    eligibility_criteria: Mapped[str] = mapped_column(Text)

class Cutoff(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"))
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    exam_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("exams.id", ondelete="SET NULL"), nullable=True)
    year: Mapped[int] = mapped_column(Integer)
    round: Mapped[int | None] = mapped_column(Integer, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    opening_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    closing_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    __table_args__ = (
        ForeignKeyConstraint(
            ['college_id', 'course_id'],
            ['college_courses.college_id', 'college_courses.course_id'],
            ondelete="CASCADE"
        ),
    )
