"""
Performance Analytics Models for Story 3.3
Comprehensive workflow analytics, performance tracking, and ROI analysis.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, ForeignKey, Integer, Float, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime
from decimal import Decimal

from app.models.base import Base, TimestampMixin, UUIDMixin


class AnalyticsEventType(str, enum.Enum):
    """Types of analytics events we track."""
    WORKFLOW_EXECUTION = "workflow_execution"
    WORKFLOW_SUCCESS = "workflow_success" 
    WORKFLOW_FAILURE = "workflow_failure"
    COMPONENT_INTERACTION = "component_interaction"
    EMAIL_SENT = "email_sent"
    EMAIL_OPENED = "email_opened"
    EMAIL_CLICKED = "email_clicked"
    CONTACT_CREATED = "contact_created"
    CONVERSION = "conversion"
    REVENUE_GENERATED = "revenue_generated"


class MetricAggregationType(str, enum.Enum):
    """How to aggregate metrics over time."""
    SUM = "sum"
    AVERAGE = "average"
    COUNT = "count"
    MIN = "min"
    MAX = "max"
    MEDIAN = "median"
    PERCENTILE_95 = "percentile_95"


class WorkflowAnalyticsEvent(Base, UUIDMixin, TimestampMixin):
    """
    Raw analytics events for workflow performance tracking.
    High-volume table optimized for time-series data.
    """
    __tablename__ = "workflow_analytics_events"

    # Core identifiers
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), index=True)
    execution_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    
    # Event details
    event_type: Mapped[AnalyticsEventType] = mapped_column(Enum(AnalyticsEventType), index=True)
    event_data: Mapped[Dict[str, Any]] = mapped_column(JSON)
    
    # Performance metrics
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer)
    resource_usage: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    
    # Business metrics
    conversion_value: Mapped[Optional[Decimal]] = mapped_column(Float(precision=10, scale=2))
    revenue_impact: Mapped[Optional[Decimal]] = mapped_column(Float(precision=10, scale=2))
    
    # Context
    component_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    source_ip: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="analytics_events")
    
    # Indexes for time-series queries
    __table_args__ = (
        Index('idx_workflow_analytics_time_type', 'created_at', 'event_type'),
        Index('idx_workflow_analytics_workflow_time', 'workflow_id', 'created_at'),
        Index('idx_workflow_analytics_user_time', 'user_id', 'created_at'),
    )


class WorkflowPerformanceMetrics(Base, UUIDMixin, TimestampMixin):
    """
    Aggregated performance metrics for workflows.
    Updated periodically for dashboard performance.
    """
    __tablename__ = "workflow_performance_metrics"

    # Identifiers
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), index=True, unique=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    
    # Time range for these metrics
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    # Execution metrics
    total_executions: Mapped[int] = mapped_column(Integer, default=0)
    successful_executions: Mapped[int] = mapped_column(Integer, default=0)
    failed_executions: Mapped[int] = mapped_column(Integer, default=0)
    success_rate: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Performance metrics
    avg_execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    median_execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    p95_execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Business metrics
    total_conversions: Mapped[int] = mapped_column(Integer, default=0)
    conversion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    total_revenue: Mapped[Decimal] = mapped_column(Float(precision=12, scale=2), default=0.0)
    avg_revenue_per_execution: Mapped[Decimal] = mapped_column(Float(precision=10, scale=2), default=0.0)
    
    # Cost analysis
    total_execution_cost: Mapped[Decimal] = mapped_column(Float(precision=10, scale=4), default=0.0)
    cost_per_execution: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    roi_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Engagement metrics
    unique_users_engaged: Mapped[int] = mapped_column(Integer, default=0)
    total_interactions: Mapped[int] = mapped_column(Integer, default=0)
    engagement_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Relationship
    workflow = relationship("Workflow", back_populates="performance_metrics")


class WorkflowABTest(Base, UUIDMixin, TimestampMixin):
    """
    A/B testing configuration and results for workflow variations.
    """
    __tablename__ = "workflow_ab_tests"

    # Test configuration
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Workflow variants
    control_workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"))
    variant_workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"))
    
    # Test parameters
    traffic_split_percentage: Mapped[int] = mapped_column(Integer, default=50)  # % for variant
    confidence_threshold: Mapped[float] = mapped_column(Float, default=0.95)
    min_sample_size: Mapped[int] = mapped_column(Integer, default=100)
    
    # Test status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Results
    control_conversions: Mapped[int] = mapped_column(Integer, default=0)
    control_total: Mapped[int] = mapped_column(Integer, default=0)
    variant_conversions: Mapped[int] = mapped_column(Integer, default=0)
    variant_total: Mapped[int] = mapped_column(Integer, default=0)
    
    # Statistical analysis
    statistical_significance: Mapped[Optional[float]] = mapped_column(Float)
    confidence_interval_lower: Mapped[Optional[float]] = mapped_column(Float)
    confidence_interval_upper: Mapped[Optional[float]] = mapped_column(Float)
    winner_workflow_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Relationships
    control_workflow = relationship("Workflow", foreign_keys=[control_workflow_id])
    variant_workflow = relationship("Workflow", foreign_keys=[variant_workflow_id])


class WorkflowCostAnalysis(Base, UUIDMixin, TimestampMixin):
    """
    Detailed cost analysis and resource usage tracking.
    """
    __tablename__ = "workflow_cost_analysis"

    # Identifiers
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), index=True)
    execution_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    # Resource costs
    compute_cost: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    storage_cost: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    network_cost: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    email_cost: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    external_api_cost: Mapped[Decimal] = mapped_column(Float(precision=8, scale=4), default=0.0)
    
    # Time savings
    manual_time_saved_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    automation_value: Mapped[Optional[Decimal]] = mapped_column(Float(precision=10, scale=2))
    
    # Resource usage details
    cpu_seconds: Mapped[Optional[float]] = mapped_column(Float)
    memory_mb_seconds: Mapped[Optional[float]] = mapped_column(Float)
    api_calls_count: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Cost attribution
    cost_breakdown: Mapped[Dict[str, Any]] = mapped_column(JSON)
    
    # Relationship
    workflow = relationship("Workflow", back_populates="cost_analysis")


class AnalyticsReport(Base, UUIDMixin, TimestampMixin):
    """
    Saved analytics reports with templates and scheduling.
    """
    __tablename__ = "analytics_reports"

    # Report details
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    
    # Report configuration
    report_type: Mapped[str] = mapped_column(String(100))  # dashboard, pdf, csv
    template_id: Mapped[Optional[str]] = mapped_column(String(255))
    filters: Mapped[Dict[str, Any]] = mapped_column(JSON)
    date_range: Mapped[Dict[str, str]] = mapped_column(JSON)
    
    # Scheduling
    is_scheduled: Mapped[bool] = mapped_column(Boolean, default=False)
    schedule_cron: Mapped[Optional[str]] = mapped_column(String(100))
    last_generated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    next_generation_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Recipients
    email_recipients: Mapped[List[str]] = mapped_column(JSON)
    
    # Report data cache
    cached_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    cache_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class ExternalAnalyticsIntegration(Base, UUIDMixin, TimestampMixin):
    """
    Configuration for external analytics platform integrations.
    """
    __tablename__ = "external_analytics_integrations"

    # Integration details
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    platform: Mapped[str] = mapped_column(String(100))  # google_analytics, hubspot, salesforce
    platform_account_id: Mapped[str] = mapped_column(String(255))
    
    # Configuration
    config: Mapped[Dict[str, Any]] = mapped_column(JSON)
    credentials: Mapped[Dict[str, Any]] = mapped_column(JSON)  # Encrypted
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    sync_status: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Data mapping
    field_mappings: Mapped[Dict[str, str]] = mapped_column(JSON)


# Add relationships to existing Workflow model
# This would be added to app/models/workflow.py:
"""
class Workflow(Base, UUIDMixin, TimestampMixin):
    # ... existing fields ...
    
    # Analytics relationships
    analytics_events = relationship("WorkflowAnalyticsEvent", back_populates="workflow")
    performance_metrics = relationship("WorkflowPerformanceMetrics", back_populates="workflow", uselist=False)
    cost_analysis = relationship("WorkflowCostAnalysis", back_populates="workflow")
"""