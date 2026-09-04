from typing import List
import uuid
from sqlalchemy import String, ForeignKey, Integer, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Test(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_marks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    exam_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("exams.id", ondelete="SET NULL"), nullable=True)

class TestSection(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "test_sections"
    
    test_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_marks: Mapped[int | None] = mapped_column(Integer, nullable=True)

class Question(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    test_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id", ondelete="CASCADE"))
    section_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("test_sections.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    question_type: Mapped[str] = mapped_column(String) # MCQ, subjective
    correct_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    marks: Mapped[int] = mapped_column(Integer, default=1)

class QuestionOption(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "question_options"
    
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    option_text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)

class TestAttempt(UUIDMixin, TimestampMixin, Base):
    test_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tests.id", ondelete="CASCADE"))
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String, default="in_progress") # in_progress, completed
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    answers: Mapped[List["TestAnswer"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")

class TestAnswer(UUIDMixin, TimestampMixin, Base):
    attempt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("test_attempts.id", ondelete="CASCADE"))
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"))
    provided_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    
    attempt: Mapped["TestAttempt"] = relationship(back_populates="answers")

class TestResult(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "test_results"
    
    attempt_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("test_attempts.id", ondelete="CASCADE"), unique=True)
    total_score: Mapped[float] = mapped_column(Integer)
    percentile: Mapped[float | None] = mapped_column(Integer, nullable=True)
    section_scores: Mapped[dict | None] = mapped_column(JSON, nullable=True)
