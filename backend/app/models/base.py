"""Base models and mixins for SQLAlchemy."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.sqlite import TEXT
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.types import TypeDecorator


# Custom UUID type for SQLite compatibility
class UUIDType(TypeDecorator):
    """SQLite-compatible UUID type."""
    impl = String(36)
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(value))
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)


from sqlalchemy.orm import declarative_base

Base = declarative_base()

class BaseModel(Base):
    """Base class for all database models."""
    __abstract__ = True
    
    id: Any


class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps."""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )


class UUIDMixin:
    """Mixin for adding UUID primary key."""
    
    id = Column(
        UUIDType, 
        primary_key=True, 
        default=uuid.uuid4, 
        nullable=False
    )