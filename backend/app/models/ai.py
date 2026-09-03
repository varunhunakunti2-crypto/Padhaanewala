from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from .base import Base

class RAGDocument(Base):
    title = Column(String, nullable=False)
    source_url = Column(String)
    document_type = Column(String) # e.g., College Prospectus, Government Circular

    chunks = relationship("DocumentChunk", back_populates="document")

class DocumentChunk(Base):
    document_id = Column(ForeignKey("rag_documents.id"), nullable=False)
    content = Column(Text, nullable=False)
    chunk_index = Column(Integer)
    
    document = relationship("RAGDocument", back_populates="chunks")
    embedding = relationship("Embedding", back_populates="chunk", uselist=False)

class Embedding(Base):
    chunk_id = Column(ForeignKey("document_chunks.id"), unique=True, nullable=False)
    vector_data = Column(Vector(1536)) # Assuming OpenAI Ada embeddings (1536 dimensions)

    chunk = relationship("DocumentChunk", back_populates="embedding")
