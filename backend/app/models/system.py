from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from .base import Base

class AnalyticsEvent(Base):
    user_id = Column(ForeignKey("users.id"), nullable=True)
    event_type = Column(String, index=True, nullable=False) # e.g., PAGE_VIEW, SEARCH, CLICK
    event_data = Column(JSON)
    url = Column(String)
    ip_address = Column(String)

class AuditLog(Base):
    user_id = Column(ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String)
    changes = Column(JSON)
