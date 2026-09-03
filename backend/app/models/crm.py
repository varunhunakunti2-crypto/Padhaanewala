from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Counsellor(Base):
    user_id = Column(ForeignKey("users.id"), unique=True, nullable=False)
    assigned_region = Column(String)
    active_leads_count = Column(String)

    user = relationship("User", back_populates="counsellor_profile")
    leads = relationship("Lead", back_populates="counsellor")

class Enquiry(Base):
    student_id = Column(ForeignKey("student_profiles.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String)
    mobile = Column(String, nullable=False)
    message = Column(Text)
    status = Column(String, default="New")
    source = Column(String)

    student = relationship("StudentProfile", back_populates="enquiries")
    lead = relationship("Lead", back_populates="enquiry", uselist=False)

class Lead(Base):
    enquiry_id = Column(ForeignKey("enquiries.id"), unique=True, nullable=False)
    counsellor_id = Column(ForeignKey("counsellors.id"), nullable=True)
    status = Column(String, default="New", index=True)
    notes = Column(Text)
    follow_up_date = Column(DateTime(timezone=True))

    enquiry = relationship("Enquiry", back_populates="lead")
    counsellor = relationship("Counsellor", back_populates="leads")
    activities = relationship("LeadActivity", back_populates="lead")

class LeadActivity(Base):
    lead_id = Column(ForeignKey("leads.id"), nullable=False)
    activity_type = Column(String, nullable=False)
    description = Column(Text)

    lead = relationship("Lead", back_populates="activities")

class Notification(Base):
    user_id = Column(ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(String, default=False)
    
    user = relationship("User")
