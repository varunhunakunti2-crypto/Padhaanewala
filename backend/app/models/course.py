from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base

class Course(Base):
    name = Column(String, index=True, nullable=False)
    degree = Column(String, index=True)
    duration_years = Column(Float)
    description = Column(Text)
    career_opportunities = Column(Text)

    college_courses = relationship("CollegeCourse", back_populates="course")

class CollegeCourse(Base):
    college_id = Column(ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(ForeignKey("courses.id"), nullable=False, index=True)
    seats = Column(Integer)
    
    college = relationship("College", back_populates="courses")
    course = relationship("Course", back_populates="college_courses")
    fees = relationship("Fee", back_populates="college_course")
    cutoffs = relationship("Cutoff", back_populates="college_course")

class Fee(Base):
    college_course_id = Column(ForeignKey("college_courses.id"), nullable=False)
    fee_type = Column(String, nullable=False) # Tuition, Hostel, etc.
    amount = Column(Float, nullable=False)
    period = Column(String) # Per year, Total, etc.
    is_approximate = Column(String, default=False)

    college_course = relationship("CollegeCourse", back_populates="fees")

class Cutoff(Base):
    college_course_id = Column(ForeignKey("college_courses.id"), nullable=False)
    exam_id = Column(ForeignKey("exams.id"))
    category = Column(String)
    year = Column(Integer)
    rank = Column(Integer)
    score = Column(Float)

    college_course = relationship("CollegeCourse", back_populates="cutoffs")
    exam = relationship("Exam")
