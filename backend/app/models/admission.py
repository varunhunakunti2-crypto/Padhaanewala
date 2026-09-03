from sqlalchemy import Column, String, Float, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from .base import Base

class Exam(Base):
    name = Column(String, index=True, nullable=False)
    conducting_authority = Column(String)
    application_start_date = Column(Date)
    application_deadline = Column(Date)
    exam_date = Column(Date)
    admit_card_date = Column(Date)
    result_date = Column(Date)
    official_website = Column(String)

class Eligibility(Base):
    college_course_id = Column(ForeignKey("college_courses.id"), nullable=False)
    criteria = Column(Text, nullable=False)
    minimum_percentage = Column(Float)

    college_course = relationship("CollegeCourse")

class AdmissionInformation(Base):
    college_id = Column(ForeignKey("colleges.id"), nullable=False, unique=True)
    procedure = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)

    college = relationship("College")

class Scholarship(Base):
    name = Column(String, index=True, nullable=False)
    provider = Column(String)
    eligibility_criteria = Column(Text)
    amount = Column(String)
    deadline = Column(Date)
    official_link = Column(String)
