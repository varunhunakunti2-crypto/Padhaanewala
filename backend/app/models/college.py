from sqlalchemy import Column, String, Integer, Float, ForeignKey, Table, Text, Date
from sqlalchemy.orm import relationship
from .base import Base

college_facilities = Table(
    "college_facilities",
    Base.metadata,
    Column("college_id", ForeignKey("colleges.id"), primary_key=True),
    Column("facility_id", ForeignKey("facilities.id"), primary_key=True)
)

class Location(Base):
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True)
    state = Column(String, index=True, nullable=False)

    colleges = relationship("College", back_populates="location")

class University(Base):
    name = Column(String, index=True, nullable=False)
    description = Column(Text)

    colleges = relationship("College", back_populates="university")

class Facility(Base):
    name = Column(String, unique=True, nullable=False)
    icon = Column(String)

    colleges = relationship("College", secondary=college_facilities, back_populates="facilities")

class College(Base):
    official_name = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    college_type = Column(String, index=True)
    ownership = Column(String, index=True) # government/private
    website = Column(String)
    email = Column(String)
    phone = Column(String)
    established_year = Column(Integer)
    accreditation = Column(String)
    recognition = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    source = Column(String)
    verification_status = Column(String, default="Unverified", index=True)
    verification_date = Column(Date)
    
    location_id = Column(ForeignKey("locations.id"))
    university_id = Column(ForeignKey("universities.id"))

    location = relationship("Location", back_populates="colleges")
    university = relationship("University", back_populates="colleges")
    facilities = relationship("Facility", secondary=college_facilities, back_populates="colleges")
    courses = relationship("CollegeCourse", back_populates="college")
    images = relationship("Media", back_populates="college")
    reviews = relationship("Review", back_populates="college")
