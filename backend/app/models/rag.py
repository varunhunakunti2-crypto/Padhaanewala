from typing import Optional
import uuid
from sqlalchemy import String, Integer, Text, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from .base import Base, UUIDMixin, TimestampMixin, ScrapedDataMixin

class DocumentEmbedding(UUIDMixin, TimestampMixin, ScrapedDataMixin, Base):
    source_table: Mapped[str] = mapped_column(String, index=True)
    source_id: Mapped[uuid.UUID] = mapped_column(index=True)
    chunk_text: Mapped[str] = mapped_column(Text)
    chunk_index: Mapped[int] = mapped_column(Integer)
    
    # Using 1536 assuming OpenAI text-embedding-3-small or ada-002.
    embedding = mapped_column(Vector(1536))
    
    embedding_model: Mapped[str] = mapped_column(String)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    __table_args__ = (
        Index(
            'ix_document_embeddings_embedding',
            'embedding',
            postgresql_using='hnsw',
            postgresql_with={'m': 16, 'ef_construction': 64},
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        ),
    )
