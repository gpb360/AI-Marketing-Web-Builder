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


# Workflow Analytics Models for Story 3.3
# Advanced analytics models for comprehensive workflow performance tracking

class WorkflowAnalyticsEvent(Base, TimestampMixin, UUIDMixin):
    """
    Time-series analytics events for comprehensive workflow performance tracking
    Stores granular execution data for advanced analytics and anomaly detection
    """
    __tablename__ = "workflow_analytics_events"
    
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    event_data: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    
    # Performance metrics
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer)  # Execution time in milliseconds
    resource_usage: Mapped[Optional[float]] = mapped_column(Float)  # Resource utilization percentage
    status: Mapped[Optional[str]] = mapped_column(String(20))  # success, failed, timeout, error
    error_code: Mapped[Optional[str]] = mapped_column(String(50))
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    
    # User and session tracking
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), index=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    # Business context
    business_value: Mapped[Optional[float]] = mapped_column(Float)  # Estimated business value of execution
    cost_estimate: Mapped[Optional[float]] = mapped_column(Float)   # Estimated cost of execution
    
    # Timestamps
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now, nullable=False, index=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="analytics_events")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="workflow_analytics")
    
    # Indexes for performance
    __table_args__ = (
        Index('ix_analytics_workflow_timestamp', 'workflow_id', 'timestamp'),
        Index('ix_analytics_event_type_timestamp', 'event_type', 'timestamp'),
        Index('ix_analytics_status_timestamp', 'status', 'timestamp'),
        Index('ix_analytics_user_workflow', 'user_id', 'workflow_id'),
    )


class WorkflowABTest(Base, TimestampMixin, UUIDMixin):
    """
    A/B testing experiments for workflow performance comparison
    Manages test configurations, traffic splitting, and statistical analysis
    """
    __tablename__ = "workflow_ab_tests"
    
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), nullable=False, index=True)
    test_name: Mapped[str] = mapped_column(String(255), nullable=False)
    test_description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Test configuration
    variant_a_config: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # Control variant configuration
    variant_b_config: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # Treatment variant configuration
    traffic_split: Mapped[float] = mapped_column(Float, default=0.50)  # 0.0 to 1.0
    
    # Test parameters
    goal_metric: Mapped[str] = mapped_column(String(100), nullable=False)  # conversion_rate, execution_time, etc.
    minimum_sample_size: Mapped[int] = mapped_column(Integer, default=1000)
    minimum_detectable_effect: Mapped[float] = mapped_column(Float, default=0.05)  # 5% minimum effect
    significance_level: Mapped[float] = mapped_column(Float, default=0.05)  # 5% alpha
    statistical_power: Mapped[float] = mapped_column(Float, default=0.80)  # 80% power
    
    # Test results
    variant_a_performance: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # Aggregated performance metrics
    variant_b_performance: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # Aggregated performance metrics
    statistical_significance: Mapped[Optional[float]] = mapped_column(Float)  # p-value
    confidence_level: Mapped[Optional[float]] = mapped_column(Float)
    effect_size: Mapped[Optional[float]] = mapped_column(Float)
    winning_variant: Mapped[Optional[str]] = mapped_column(String(10))  # 'A', 'B', or 'inconclusive'
    
    # Business impact
    estimated_business_impact: Mapped[Optional[float]] = mapped_column(Float)
    roi_improvement: Mapped[Optional[float]] = mapped_column(Float)
    
    # Test lifecycle
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, running, completed, cancelled
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    actual_end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Configuration
    early_stopping_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    max_duration_days: Mapped[int] = mapped_column(Integer, default=30)
    created_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="ab_tests")
    creator: Mapped[Optional["User"]] = relationship("User", back_populates="created_ab_tests")
    assignments: Mapped[List["ABTestAssignment"]] = relationship("ABTestAssignment", back_populates="ab_test", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_ab_tests_workflow_status', 'workflow_id', 'status'),
        Index('ix_ab_tests_dates', 'start_date', 'end_date'),
        Index('ix_ab_tests_winning_variant', 'winning_variant'),
    )


class ABTestAssignment(Base, TimestampMixin, UUIDMixin):
    """
    User assignments for A/B test variants
    Ensures consistent assignment using deterministic hashing
    """
    __tablename__ = "ab_test_assignments"
    
    ab_test_id: Mapped[str] = mapped_column(ForeignKey("workflow_ab_tests.id"), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    session_id: Mapped[Optional[str]] = mapped_column(String(255))  # For anonymous users
    
    assigned_variant: Mapped[str] = mapped_column(String(10), nullable=False)  # 'A' or 'B'
    assignment_hash: Mapped[Optional[str]] = mapped_column(String(64))  # For consistency verification
    
    # Assignment metadata
    assignment_timestamp: Mapped[datetime] = mapped_column(DateTime, default=func.now, nullable=False)
    first_exposure: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    last_activity: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    
    # Performance tracking
    conversion_achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    conversion_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime)
    total_interactions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    ab_test: Mapped["WorkflowABTest"] = relationship("WorkflowABTest", back_populates="assignments")
    user: Mapped[Optional["User"]] = relationship("User", back_populates="ab_test_assignments")
    
    # Indexes
    __table_args__ = (
        Index('ix_ab_assignments_test_user', 'ab_test_id', 'user_id'),
        Index('ix_ab_assignments_test_session', 'ab_test_id', 'session_id'),
        Index('ix_ab_assignments_variant', 'assigned_variant'),
    )


class ExternalAnalyticsConnection(Base, TimestampMixin, UUIDMixin):
    """
    External analytics platform connections
    Manages third-party integrations for unified reporting
    """
    __tablename__ = "external_analytics_connections"
    
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    platform: Mapped[str] = mapped_column(String(50), nullable=False)  # google_analytics, hubspot, salesforce, etc.
    connection_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Connection configuration
    connection_config: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # API keys, endpoints, etc.
    sync_configuration: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # Sync settings and preferences
    
    # Authentication
    access_token: Mapped[Optional[str]] = mapped_column(Text)  # Encrypted
    refresh_token: Mapped[Optional[str]] = mapped_column(Text)  # Encrypted
    token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Sync status
    sync_status: Mapped[str] = mapped_column(String(20), default="active")  # active, paused, error, disconnected
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime)
    next_sync: Mapped[Optional[datetime]] = mapped_column(DateTime)
    sync_frequency: Mapped[str] = mapped_column(String(20), default="daily")  # real_time, hourly, daily, weekly
    
    # Error tracking
    sync_errors: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # Recent sync errors
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    last_error: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Data mapping
    metric_mappings: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # How to map external metrics to internal ones
    attribution_window_hours: Mapped[int] = mapped_column(Integer, default=24)
    
    # Performance tracking
    total_records_synced: Mapped[int] = mapped_column(Integer, default=0)
    last_sync_record_count: Mapped[int] = mapped_column(Integer, default=0)
    data_quality_score: Mapped[Optional[float]] = mapped_column(Float)  # 0.00 to 1.00
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="external_analytics_connections")
    sync_logs: Mapped[List["ExternalSyncLog"]] = relationship("ExternalSyncLog", back_populates="connection", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_ext_analytics_user_platform', 'user_id', 'platform'),
        Index('ix_ext_analytics_sync_status', 'sync_status'),
        Index('ix_ext_analytics_last_sync', 'last_sync'),
    )


class ExternalSyncLog(Base, TimestampMixin, UUIDMixin):
    """
    Detailed logs for external analytics synchronization
    Tracks sync performance and data quality
    """
    __tablename__ = "external_sync_logs"
    
    connection_id: Mapped[str] = mapped_column(ForeignKey("external_analytics_connections.id"), nullable=False)
    
    # Sync details
    sync_type: Mapped[str] = mapped_column(String(20), nullable=False)  # full, incremental, real_time
    sync_status: Mapped[str] = mapped_column(String(20), nullable=False)  # success, partial, failed
    
    # Data metrics
    records_requested: Mapped[int] = mapped_column(Integer, default=0)
    records_received: Mapped[int] = mapped_column(Integer, default=0)
    records_processed: Mapped[int] = mapped_column(Integer, default=0)
    records_inserted: Mapped[int] = mapped_column(Integer, default=0)
    records_updated: Mapped[int] = mapped_column(Integer, default=0)
    records_skipped: Mapped[int] = mapped_column(Integer, default=0)
    
    # Performance metrics
    sync_duration_ms: Mapped[Optional[int]] = mapped_column(Integer)
    api_calls_made: Mapped[int] = mapped_column(Integer, default=0)
    rate_limit_hits: Mapped[int] = mapped_column(Integer, default=0)
    
    # Error tracking
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    error_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    
    # Data quality
    data_quality_issues: Mapped[Optional[List[str]]] = mapped_column(JSON)  # Array of data quality problems found
    data_validation_score: Mapped[Optional[float]] = mapped_column(Float)
    
    # Timestamps
    sync_started_at: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    sync_completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    data_timestamp_start: Mapped[Optional[datetime]] = mapped_column(DateTime)  # Start of data range synced
    data_timestamp_end: Mapped[Optional[datetime]] = mapped_column(DateTime)    # End of data range synced
    
    # Relationships
    connection: Mapped["ExternalAnalyticsConnection"] = relationship("ExternalAnalyticsConnection", back_populates="sync_logs")
    
    # Indexes
    __table_args__ = (
        Index('ix_sync_logs_connection_date', 'connection_id', 'sync_started_at'),
        Index('ix_sync_logs_status', 'sync_status'),
        Index('ix_sync_logs_sync_type', 'sync_type'),
    )


class WorkflowPerformanceBenchmark(Base, TimestampMixin, UUIDMixin):
    """
    Industry and competitive benchmarks for workflow performance
    Used for comparative analysis and goal setting
    """
    __tablename__ = "workflow_performance_benchmarks"
    
    # Benchmark classification
    industry: Mapped[Optional[str]] = mapped_column(String(100))  # e.g., "e-commerce", "saas", "healthcare"
    workflow_type: Mapped[Optional[str]] = mapped_column(String(100))  # e.g., "lead_nurturing", "customer_onboarding"
    company_size: Mapped[Optional[str]] = mapped_column(String(20))   # startup, small, medium, enterprise
    
    # Performance benchmarks
    avg_conversion_rate: Mapped[Optional[float]] = mapped_column(Float)
    avg_execution_time_seconds: Mapped[Optional[float]] = mapped_column(Float)
    avg_success_rate: Mapped[Optional[float]] = mapped_column(Float)
    avg_cost_per_execution: Mapped[Optional[float]] = mapped_column(Float)
    avg_roi_percentage: Mapped[Optional[float]] = mapped_column(Float)
    
    # Business impact benchmarks
    avg_time_savings_hours: Mapped[Optional[float]] = mapped_column(Float)
    avg_revenue_per_execution: Mapped[Optional[float]] = mapped_column(Float)
    avg_customer_satisfaction: Mapped[Optional[float]] = mapped_column(Float)
    
    # Data quality metrics
    sample_size: Mapped[Optional[int]] = mapped_column(Integer)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.95)
    data_source: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Validity period
    valid_from: Mapped[datetime] = mapped_column(DateTime, default=func.now)
    valid_until: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Indexes
    __table_args__ = (
        Index('ix_benchmarks_industry_type', 'industry', 'workflow_type'),
        Index('ix_benchmarks_company_size', 'company_size'),
        Index('ix_benchmarks_validity', 'valid_from', 'valid_until'),
    )


class WorkflowAnalyticsReport(Base, TimestampMixin, UUIDMixin):
    """
    Generated analytics reports for scheduled delivery and archival
    Stores comprehensive analysis results for historical tracking
    """
    __tablename__ = "workflow_analytics_reports"
    
    workflow_id: Mapped[str] = mapped_column(ForeignKey("workflows.id"), nullable=False, index=True)
    generated_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Report metadata
    report_type: Mapped[str] = mapped_column(String(50), nullable=False)  # comprehensive, cost_analysis, ab_test
    report_name: Mapped[str] = mapped_column(String(255), nullable=False)
    report_description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Report configuration
    time_period: Mapped[str] = mapped_column(String(20), nullable=False)  # HOUR, DAY, WEEK, MONTH, etc.
    analysis_parameters: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)  # Configuration used for analysis
    
    # Generated content
    report_data: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # Complete analysis results
    executive_summary: Mapped[Optional[str]] = mapped_column(Text)  # Human-readable summary
    key_insights: Mapped[Optional[List[str]]] = mapped_column(JSON)  # Array of key insights
    recommendations: Mapped[Optional[List[str]]] = mapped_column(JSON)  # Array of recommendations
    
    # Export formats
    pdf_file_path: Mapped[Optional[str]] = mapped_column(String(500))  # Path to generated PDF
    csv_file_path: Mapped[Optional[str]] = mapped_column(String(500))  # Path to generated CSV
    json_file_path: Mapped[Optional[str]] = mapped_column(String(500))  # Path to JSON export
    
    # Performance metrics
    generation_time_ms: Mapped[Optional[int]] = mapped_column(Integer)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Delivery tracking
    delivery_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, sent, failed
    delivery_attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_delivery_attempt: Mapped[Optional[datetime]] = mapped_column(DateTime)
    delivery_error: Mapped[Optional[str]] = mapped_column(Text)
    
    # Timestamps
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)  # Report expiration for cleanup
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="analytics_reports")
    generator: Mapped["User"] = relationship("User", back_populates="generated_reports")
    
    # Indexes
    __table_args__ = (
        Index('ix_reports_workflow_generated', 'workflow_id', 'generated_at'),
        Index('ix_reports_type_period', 'report_type', 'time_period'),
        Index('ix_reports_delivery_status', 'delivery_status'),
        Index('ix_reports_expires_at', 'expires_at'),
    )