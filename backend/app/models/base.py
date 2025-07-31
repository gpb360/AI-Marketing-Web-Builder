"""Base models and mixins for SQLAlchemy."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class BaseModel:
    """Base class for all database models."""
    
    id: Any
    __name__: str
    
    # Generate table name automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()


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
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        nullable=False
    )