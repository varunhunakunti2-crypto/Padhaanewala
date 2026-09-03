from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .base import Base

class QuestionBank(Base):
    name = Column(String, nullable=False)
    subject = Column(String, index=True)
    description = Column(Text)

class Question(Base):
    bank_id = Column(ForeignKey("question_banks.id"), nullable=False)
    content = Column(Text, nullable=False)
    options = Column(JSON, nullable=False) # Store options as JSON array
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String)
    explanation = Column(Text)

    bank = relationship("QuestionBank")

class MockTest(Base):
    name = Column(String, nullable=False)
    exam_id = Column(ForeignKey("exams.id"))
    duration_minutes = Column(Integer)
    total_marks = Column(Float)
    difficulty = Column(String)

    exam = relationship("Exam")
    questions = relationship("MockTestQuestion", back_populates="test")

class MockTestQuestion(Base):
    test_id = Column(ForeignKey("mock_tests.id"), nullable=False)
    question_id = Column(ForeignKey("questions.id"), nullable=False)
    marks = Column(Float, default=1.0)
    negative_marks = Column(Float, default=0.0)

    test = relationship("MockTest", back_populates="questions")
    question = relationship("Question")

class TestAttempt(Base):
    student_id = Column(ForeignKey("student_profiles.id"), nullable=False)
    test_id = Column(ForeignKey("mock_tests.id"), nullable=False)
    status = Column(String, default="In Progress") # Completed, In Progress
    time_taken_seconds = Column(Integer)
    
    student = relationship("StudentProfile", back_populates="test_attempts")
    test = relationship("MockTest")
    result = relationship("TestResult", back_populates="attempt", uselist=False)

class TestResult(Base):
    attempt_id = Column(ForeignKey("test_attempts.id"), unique=True, nullable=False)
    score = Column(Float)
    correct_answers = Column(Integer)
    incorrect_answers = Column(Integer)
    unattempted = Column(Integer)
    percentile = Column(Float)
    
    attempt = relationship("TestAttempt", back_populates="result")
