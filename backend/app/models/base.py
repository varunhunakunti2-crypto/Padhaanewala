import uuid
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base, declared_attr
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import re

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

class CustomBase:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    @declared_attr
    def __tablename__(cls) -> str:
        snake_name = camel_to_snake(cls.__name__)
        if snake_name.endswith('s'):
            return snake_name
        elif snake_name.endswith('y'):
            return snake_name[:-1] + 'ies'
        return snake_name + "s"

Base = declarative_base(cls=CustomBase)
