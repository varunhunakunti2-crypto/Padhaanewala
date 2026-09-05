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
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    official_name: Mapped[str | None] = mapped_column(String, nullable=True)
    college_type: Mapped[str | None] = mapped_column(String, nullable=True) # dental, medical, engineering, ayush...
    is_private: Mapped[bool] = mapped_column(Boolean, default=True) # True = private, False = government
    accreditation: Mapped[str | None] = mapped_column(String, nullable=True) # e.g. NAAC A, NABH
    recognition: Mapped[str | None] = mapped_column(String, nullable=True) # e.g. NMC, AICTE approved
    established_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    pincode: Mapped[str | None] = mapped_column(String, nullable=True)
    entrance_exam: Mapped[str | None] = mapped_column(String, nullable=True) # e.g. NEET, KCET
    admission_status: Mapped[str | None] = mapped_column(String, nullable=True) # open / closed / tentative
    rating: Mapped[float | None] = mapped_column(Float, nullable=True) # denormalized from approved reviews
    has_hostel: Mapped[bool] = mapped_column(Boolean, default=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    google_maps_url: Mapped[str | None] = mapped_column(String, nullable=True)
    google_place_id: Mapped[str | None] = mapped_column(String, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_by_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    university_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("universities.id", ondelete="SET NULL"), nullable=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)
    
    university: Mapped[Optional["University"]] = relationship(back_populates="colleges")
    courses: Mapped[List["Course"]] = relationship(secondary="college_courses", back_populates="colleges")
    facilities: Mapped[List["Facility"]] = relationship(secondary="college_facilities")

class Course(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    name: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    level: Mapped[str | None] = mapped_column(String, nullable=True) # e.g., UG, PG
    degree: Mapped[str | None] = mapped_column(String, nullable=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    entrance_exam: Mapped[str | None] = mapped_column(String, nullable=True)
    admission_procedure: Mapped[str | None] = mapped_column(Text, nullable=True)
    career_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    fee_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_title: Mapped[str | None] = mapped_column(String, nullable=True)
    meta_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    
    colleges: Mapped[List["College"]] = relationship(secondary="college_courses", back_populates="courses")

class CollegeCourse(TimestampMixin, ScrapedDataMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    duration_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    intake: Mapped[int | None] = mapped_column(Integer, nullable=True)

class Fee(UUIDMixin, TimestampMixin, Base):
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"))
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    
    tuition_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    hostel_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    exam_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    other_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_fee: Mapped[float | None] = mapped_column(Float, nullable=True)
    period: Mapped[str | None] = mapped_column(String, nullable=True) # e.g., Yearly, Semester
    is_approximate: Mapped[bool] = mapped_column(Boolean, default=True)
    disclaimer: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    __table_args__ = (
        ForeignKeyConstraint(
            ['college_id', 'course_id'],
            ['college_courses.college_id', 'college_courses.course_id'],
            ondelete="CASCADE"
        ),
    )

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
