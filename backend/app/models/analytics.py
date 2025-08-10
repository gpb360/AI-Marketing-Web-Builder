"""
Analytics models for template performance tracking and analysis.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, Integer, ForeignKey, Float, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.models.base import Base, TimestampMixin, UUIDMixin


class MetricType(str, enum.Enum):
    """Analytics metric types."""
    CONVERSION_RATE = "conversion_rate"
    BOUNCE_RATE = "bounce_rate"
    SESSION_DURATION = "session_duration"
    CLICK_THROUGH_RATE = "click_through_rate"
    PAGE_LOAD_TIME = "page_load_time"
    USER_ENGAGEMENT = "user_engagement"
    FORM_COMPLETION = "form_completion"
    SCROLL_DEPTH = "scroll_depth"


class PerformanceBand(str, enum.Enum):
    """Template performance bands."""
    TOP_PERFORMER = "top_performer"  # Top 10%
    GOOD = "good"  # 11-30%
    AVERAGE = "average"  # 31-70%
    POOR = "poor"  # 71-90%
    UNDERPERFORMING = "underperforming"  # Bottom 10%


class TemplateAnalytics(Base, TimestampMixin, UUIDMixin):
    """Template performance analytics and metrics."""
    
    __tablename__ = "template_analytics"
    
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=func.now)
    
    # Core metrics
    page_views: Mapped[int] = mapped_column(Integer, default=0)
    unique_visitors: Mapped[int] = mapped_column(Integer, default=0)
    sessions: Mapped[int] = mapped_column(Integer, default=0)
    conversions: Mapped[int] = mapped_column(Integer, default=0)
    bounces: Mapped[int] = mapped_column(Integer, default=0)
    
    # Performance metrics
    conversion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    bounce_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_session_duration: Mapped[float] = mapped_column(Float, default=0.0)
    avg_page_load_time: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Engagement metrics
    avg_scroll_depth: Mapped[float] = mapped_column(Float, default=0.0)
    form_interactions: Mapped[int] = mapped_column(Integer, default=0)
    form_completions: Mapped[int] = mapped_column(Integer, default=0)
    cta_clicks: Mapped[int] = mapped_column(Integer, default=0)
    
    # User behavior
    returning_visitors: Mapped[int] = mapped_column(Integer, default=0)
    new_visitors: Mapped[int] = mapped_column(Integer, default=0)
    mobile_users: Mapped[int] = mapped_column(Integer, default=0)
    desktop_users: Mapped[int] = mapped_column(Integer, default=0)
    
    # Geographical data
    top_countries: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    top_cities: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    
    # Referral sources
    organic_traffic: Mapped[int] = mapped_column(Integer, default=0)
    direct_traffic: Mapped[int] = mapped_column(Integer, default=0)
    referral_traffic: Mapped[int] = mapped_column(Integer, default=0)
    social_traffic: Mapped[int] = mapped_column(Integer, default=0)
    paid_traffic: Mapped[int] = mapped_column(Integer, default=0)
    
    # Advanced metrics
    user_satisfaction_score: Mapped[Optional[float]] = mapped_column(Float)
    net_promoter_score: Mapped[Optional[float]] = mapped_column(Float)
    task_completion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template", back_populates="analytics")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_template_date', 'template_id', 'date'),
        Index('idx_template_conversion', 'template_id', 'conversion_rate'),
        Index('idx_date_range', 'date'),
    )
    
    def __repr__(self) -> str:
        return f"<TemplateAnalytics(template_id={self.template_id}, date={self.date}, conversion_rate={self.conversion_rate:.3f})>"


class TemplateRanking(Base, TimestampMixin, UUIDMixin):
    """Template ranking and scoring system."""
    
    __tablename__ = "template_rankings"
    
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Overall scores
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    popularity_score: Mapped[float] = mapped_column(Float, default=0.0)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)
    success_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Ranking positions
    overall_rank: Mapped[int] = mapped_column(Integer, default=0)
    category_rank: Mapped[int] = mapped_column(Integer, default=0)
    performance_band: Mapped[PerformanceBand] = mapped_column(Enum(PerformanceBand), default=PerformanceBand.AVERAGE)
    
    # Trend indicators
    rank_change_7d: Mapped[int] = mapped_column(Integer, default=0)
    rank_change_30d: Mapped[int] = mapped_column(Integer, default=0)
    score_change_7d: Mapped[float] = mapped_column(Float, default=0.0)
    score_change_30d: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Performance metrics aggregated
    avg_conversion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_bounce_rate: Mapped[float] = mapped_column(Float, default=0.0)
    avg_session_duration: Mapped[float] = mapped_column(Float, default=0.0)
    total_usage: Mapped[int] = mapped_column(Integer, default=0)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    
    # User feedback
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    recommendation_rate: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Last analysis
    last_analyzed_at: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    analysis_version: Mapped[int] = mapped_column(Integer, default=1)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template", back_populates="ranking")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_overall_rank', 'overall_rank'),
        Index('idx_category_rank', 'category', 'category_rank'),
        Index('idx_performance_band', 'performance_band'),
        Index('idx_overall_score', 'overall_score'),
    )
    
    def __repr__(self) -> str:
        return f"<TemplateRanking(template_id={self.template_id}, overall_rank={self.overall_rank}, score={self.overall_score:.3f})>"


class ConversionEvent(Base, TimestampMixin, UUIDMixin):
    """Individual conversion events for templates."""
    
    __tablename__ = "conversion_events"
    
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"), nullable=False)
    project_id: Mapped[Optional[str]] = mapped_column(ForeignKey("projects.id"))
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    
    # Event details
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # form_submit, purchase, signup, etc.
    event_value: Mapped[Optional[float]] = mapped_column(Float)
    conversion_funnel_step: Mapped[int] = mapped_column(Integer, default=1)
    
    # Session context
    session_id: Mapped[str] = mapped_column(String(255))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    referrer: Mapped[Optional[str]] = mapped_column(Text)
    
    # Page context
    page_url: Mapped[str] = mapped_column(Text, nullable=False)
    page_title: Mapped[Optional[str]] = mapped_column(String(200))
    
    # Performance context
    page_load_time: Mapped[Optional[float]] = mapped_column(Float)
    time_on_page: Mapped[Optional[float]] = mapped_column(Float)
    scroll_depth: Mapped[Optional[float]] = mapped_column(Float)
    
    # Additional metadata
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template")
    project: Mapped[Optional["Project"]] = relationship("Project")
    user: Mapped[Optional["User"]] = relationship("User")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_template_event', 'template_id', 'event_type'),
        Index('idx_session', 'session_id'),
        Index('idx_event_date', 'created_at'),
    )
    
    def __repr__(self) -> str:
        return f"<ConversionEvent(template_id={self.template_id}, event_type={self.event_type}, created_at={self.created_at})>"


class TemplateUsage(Base, TimestampMixin, UUIDMixin):
    """Template usage tracking and adoption patterns."""
    
    __tablename__ = "template_usage"
    
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    project_id: Mapped[Optional[str]] = mapped_column(ForeignKey("projects.id"))
    
    # Usage details
    usage_type: Mapped[str] = mapped_column(String(50), nullable=False)  # preview, clone, customize, publish
    usage_duration: Mapped[Optional[float]] = mapped_column(Float)  # minutes
    customizations_made: Mapped[int] = mapped_column(Integer, default=0)
    
    # Success indicators
    was_published: Mapped[bool] = mapped_column(Boolean, default=False)
    was_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    satisfaction_rating: Mapped[Optional[int]] = mapped_column(Integer)  # 1-5 stars
    
    # Workflow success
    workflow_success: Mapped[bool] = mapped_column(Boolean, default=False)
    workflow_completion_rate: Mapped[Optional[float]] = mapped_column(Float)
    
    # User context
    user_experience_level: Mapped[Optional[str]] = mapped_column(String(50))  # beginner, intermediate, advanced
    user_industry: Mapped[Optional[str]] = mapped_column(String(100))
    user_company_size: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Performance impact
    achieved_goals: Mapped[List[str]] = mapped_column(JSON, default=list)
    performance_improvement: Mapped[Optional[float]] = mapped_column(Float)
    
    # Additional metadata
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template")
    user: Mapped["User"] = relationship("User")
    project: Mapped[Optional["Project"]] = relationship("Project")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_template_user', 'template_id', 'user_id'),
        Index('idx_usage_type', 'usage_type'),
        Index('idx_success', 'was_published', 'was_completed'),
    )
    
    def __repr__(self) -> str:
        return f"<TemplateUsage(template_id={self.template_id}, user_id={self.user_id}, usage_type={self.usage_type})>"


class TemplateOptimizationRecommendation(Base, TimestampMixin, UUIDMixin):
    """AI-generated optimization recommendations for templates."""
    
    __tablename__ = "template_optimization_recommendations"
    
    template_id: Mapped[str] = mapped_column(ForeignKey("templates.id"), nullable=False)
    
    # Recommendation details
    recommendation_type: Mapped[str] = mapped_column(String(100), nullable=False)  # conversion, ux, performance, content
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, applied, dismissed
    
    # Recommendation content
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    implementation_steps: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Impact predictions
    estimated_improvement: Mapped[Optional[float]] = mapped_column(Float)  # percentage improvement
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-1
    impact_area: Mapped[str] = mapped_column(String(100))  # conversion_rate, bounce_rate, etc.
    
    # Implementation details
    effort_level: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high
    estimated_time_hours: Mapped[Optional[int]] = mapped_column(Integer)
    required_skills: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Tracking
    was_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_improvement: Mapped[Optional[float]] = mapped_column(Float)
    
    # Analysis context
    based_on_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    analysis_version: Mapped[int] = mapped_column(Integer, default=1)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_template_priority', 'template_id', 'priority'),
        Index('idx_status', 'status'),
        Index('idx_recommendation_type', 'recommendation_type'),
    )
    
    def __repr__(self) -> str:
        return f"<TemplateOptimizationRecommendation(template_id={self.template_id}, type={self.recommendation_type}, priority={self.priority})>"