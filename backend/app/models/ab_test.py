"""
A/B testing models for template optimization.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, Integer, ForeignKey, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.models.base import Base, TimestampMixin


class ABTestStatus(str, enum.Enum):
    """A/B test status."""
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    STOPPED = "stopped"


class ABTest(Base, TimestampMixin):
    """A/B test model for template optimization."""
    
    __tablename__ = "ab_tests"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Test configuration
    base_template_id: Mapped[int] = mapped_column(Integer, ForeignKey("templates.id"), nullable=False)
    primary_metric: Mapped[str] = mapped_column(String(100), default="conversion_rate")
    status: Mapped[ABTestStatus] = mapped_column(Enum(ABTestStatus), default=ABTestStatus.DRAFT)
    
    # Statistical parameters
    required_sample_size: Mapped[int] = mapped_column(Integer, default=1000)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.95)
    power: Mapped[float] = mapped_column(Float, default=0.8)
    
    # Test timeline
    started_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    expected_completion_date: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    
    # Results and configuration
    configuration: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    final_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    stop_reason: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Relationships
    base_template: Mapped["Template"] = relationship("Template")
    variants: Mapped[List["ABTestVariant"]] = relationship("ABTestVariant", back_populates="ab_test")
    
    def __repr__(self) -> str:
        return f"<ABTest(id={self.id}, name='{self.name}', status='{self.status}')>"


class ABTestVariant(Base, TimestampMixin):
    """A/B test variant model."""
    
    __tablename__ = "ab_test_variants"
    
    ab_test_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_tests.id"), nullable=False)
    
    # Variant identification
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_control: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Traffic distribution
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Template data
    template_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    configuration: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Performance metrics
    views: Mapped[int] = mapped_column(Integer, default=0)
    conversions: Mapped[int] = mapped_column(Integer, default=0)
    bounces: Mapped[int] = mapped_column(Integer, default=0)
    
    # Event tracking
    event_metadata: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    
    # Relationships
    ab_test: Mapped["ABTest"] = relationship("ABTest", back_populates="variants")
    
    @property
    def conversion_rate(self) -> float:
        """Calculate conversion rate for this variant."""
        return self.conversions / self.views if self.views > 0 else 0.0
    
    @property
    def bounce_rate(self) -> float:
        """Calculate bounce rate for this variant."""
        return self.bounces / self.views if self.views > 0 else 0.0
    
    def __repr__(self) -> str:
        return f"<ABTestVariant(id={self.id}, name='{self.name}', test_id={self.ab_test_id})>"


class ABTestEvent(Base, TimestampMixin):
    """A/B test event tracking model."""
    
    __tablename__ = "ab_test_events"
    
    ab_test_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_tests.id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_test_variants.id"), nullable=False)
    
    # Event details
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # view, conversion, bounce, etc.
    session_id: Mapped[Optional[str]] = mapped_column(String(255))
    user_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Event metadata
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    ab_test: Mapped["ABTest"] = relationship("ABTest")
    variant: Mapped["ABTestVariant"] = relationship("ABTestVariant")
    
    def __repr__(self) -> str:
        return f"<ABTestEvent(id={self.id}, type='{self.event_type}', test_id={self.ab_test_id})>"