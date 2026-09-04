import uuid
from sqlalchemy import String, ForeignKey, Integer, Text, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin

class Review(UUIDMixin, TimestampMixin, SoftDeleteMixin, ScrapedDataMixin, Base):
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    college_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("colleges.id", ondelete="CASCADE"), nullable=True)
    course_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=True)
    
    rating: Mapped[int] = mapped_column(Integer)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending") # pending, approved, rejected

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

class ReviewModeration(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "review_moderation"
    
    review_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reviews.id", ondelete="CASCADE"), unique=True)
    moderator_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False) # e.g. approved, rejected, flagged
    notes: Mapped[str | None] = mapped_column(Text)
