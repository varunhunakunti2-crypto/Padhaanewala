from sqlalchemy import Column, String, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from .base import Base

class BlogArticle(Base):
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    featured_image = Column(String)
    category = Column(String, index=True)
    author_id = Column(ForeignKey("users.id"))
    meta_title = Column(String)
    meta_description = Column(String)
    canonical_url = Column(String)
    is_published = Column(Boolean, default=False)

    author = relationship("User")

class FAQ(Base):
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, index=True)

class CMSContent(Base):
    page_identifier = Column(String, unique=True, index=True, nullable=False)
    section = Column(String)
    content_json = Column(Text) # Store as stringified JSON

class Review(Base):
    student_id = Column(ForeignKey("student_profiles.id"), nullable=False)
    college_id = Column(ForeignKey("colleges.id"), nullable=False)
    course_id = Column(ForeignKey("courses.id"))
    rating = Column(Float, nullable=False)
    review_text = Column(Text)
    status = Column(String, default="Submitted") # Submitted, Moderation, Approved, Rejected

    student = relationship("StudentProfile")
    college = relationship("College", back_populates="reviews")

class Media(Base):
    url = Column(String, nullable=False)
    college_id = Column(ForeignKey("colleges.id"))
    image_type = Column(String) # Gallery, Logo, Banner
    alt_text = Column(String)

    college = relationship("College", back_populates="images")
