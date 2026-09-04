import uuid
from sqlalchemy import String, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base, UUIDMixin, TimestampMixin, SoftDeleteMixin

class Post(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    author_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    post_type: Mapped[str] = mapped_column(String, default="blog") # blog, article

class Category(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "categories"
    
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

class PostCategory(TimestampMixin, Base):
    __tablename__ = "post_categories"
    
    post_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)

class FAQ(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "faqs"
    
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_type: Mapped[str | None] = mapped_column(String, nullable=True) # e.g. college, course
    entity_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)

class Banner(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "banners"
    
    image_url: Mapped[str] = mapped_column(String)
    link_url: Mapped[str | None] = mapped_column(String, nullable=True)
    position: Mapped[str] = mapped_column(String) # e.g. home_hero, sidebar
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class HomepageContent(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "homepage_content"

    section: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    order: Mapped[int] = mapped_column(Integer, default=0)


class SEOMetadata(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "seo_metadata"
    
    entity_type: Mapped[str] = mapped_column(String)
    entity_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    keywords: Mapped[str | None] = mapped_column(Text, nullable=True)
    og_image: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Optional unique constraint per entity
    # __table_args__ = (UniqueConstraint("entity_type", "entity_id", name="uix_seo_entity"),)
