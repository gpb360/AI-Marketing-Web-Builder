"""
User model for authentication and user management.
"""

from typing import Optional, List
from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, TimestampMixin, UUIDMixin):
    """User model for authentication and profile management."""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Profile information
    company: Mapped[Optional[str]] = mapped_column(String(200))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Relationships (using string references to avoid circular imports)
    sites: Mapped[List["Site"]] = relationship("Site", back_populates="owner")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="owner")
    workflows: Mapped[List["Workflow"]] = relationship("Workflow", back_populates="owner")
    contacts: Mapped[List["Contact"]] = relationship("Contact", back_populates="user")
    email_campaigns: Mapped[List["EmailCampaign"]] = relationship("EmailCampaign", back_populates="user")
    business_context_analyses: Mapped[List["BusinessContextAnalysis"]] = relationship("BusinessContextAnalysis", back_populates="user")
    business_context_usage: Mapped[List["BusinessContextUsageAnalytics"]] = relationship("BusinessContextUsageAnalytics", back_populates="user")
    template_context_scorings: Mapped[List["TemplateContextScoring"]] = relationship("TemplateContextScoring", back_populates="user")
    epic_integration_metrics: Mapped[List["EpicIntegrationMetrics"]] = relationship("EpicIntegrationMetrics", back_populates="user")
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"