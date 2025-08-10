"""User model for authentication and account management."""

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel, UUIDMixin, TimestampMixin


class SubscriptionTier(str, enum.Enum):
    """Subscription tier options."""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class User(BaseModel, UUIDMixin, TimestampMixin):
    """User model for platform accounts."""
    
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    subscription_tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.FREE)
    
    # User preferences and settings
    preferences = Column(JSON, default=dict)
    
    # Authentication fields
    last_login = Column(DateTime)
    password_reset_token = Column(String(255))
    verification_token = Column(String(255))
    
    # Relationships
    sites = relationship("Site", back_populates="owner", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="user", cascade="all, delete-orphan")
    email_campaigns = relationship("EmailCampaign", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User(email='{self.email}', tier='{self.subscription_tier}')>"
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.email
    
    @property
    def display_name(self) -> str:
        """Get display name for UI."""
        return self.full_name or self.email.split('@')[0]