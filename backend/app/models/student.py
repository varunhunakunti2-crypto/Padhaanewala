from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Integer, UniqueConstraint, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Student(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    location_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    date_of_birth: Mapped[Date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # user: Mapped["User"] = relationship(back_populates="student")

class StudentInterest(TimestampMixin, Base):
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    course_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)

class StudentEducationHistory(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "student_education_histories"
    
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    institution_name: Mapped[str] = mapped_column(String)
    degree_or_class: Mapped[str] = mapped_column(String)
    passing_year: Mapped[int | None] = mapped_column(Integer)
    percentage: Mapped[int | None] = mapped_column(Integer)

class StudentSavedCollege(TimestampMixin, Base):
    __tablename__ = "student_saved_colleges"
    
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    college_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True)

class StudentScholarshipInterest(TimestampMixin, Base):
    __tablename__ = "student_scholarship_interests"
    
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), primary_key=True)
    scholarship_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scholarships.id", ondelete="CASCADE"), primary_key=True)
