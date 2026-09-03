from sqlalchemy import Column, String, Integer, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from .base import Base

class StudentProfile(Base):
    user_id = Column(ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    mobile = Column(String, index=True)
    dob = Column(Date)
    education_level = Column(String)
    preferred_state = Column(String)
    preferred_city = Column(String)
    budget = Column(Integer)

    user = relationship("User", back_populates="student_profile")
    saved_colleges = relationship("SavedCollege", back_populates="student")
    interests = relationship("StudentInterest", back_populates="student")
    enquiries = relationship("Enquiry", back_populates="student")
    test_attempts = relationship("TestAttempt", back_populates="student")

class SavedCollege(Base):
    student_id = Column(ForeignKey("student_profiles.id"), nullable=False)
    college_id = Column(ForeignKey("colleges.id"), nullable=False)

    student = relationship("StudentProfile", back_populates="saved_colleges")
    college = relationship("College")

class StudentInterest(Base):
    student_id = Column(ForeignKey("student_profiles.id"), nullable=False)
    course_id = Column(ForeignKey("courses.id"), nullable=False)

    student = relationship("StudentProfile", back_populates="interests")
    course = relationship("Course")
