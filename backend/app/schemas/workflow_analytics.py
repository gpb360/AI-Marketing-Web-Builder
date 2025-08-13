"""
Pydantic schemas for Workflow Analytics API endpoints
Data validation and serialization models for Story 3.3 advanced analytics
"""

from datetime import datetime
from typing import List, Dict, Any, Optional, Union
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field, validator


class AnalyticsTimePeriod(str, Enum):
    """Time period options for analytics analysis"""
    HOUR = "1h"
    DAY = "1d"
    WEEK = "7d"
    MONTH = "30d"
    QUARTER = "90d"
    YEAR = "365d"


class AnomalySeverity(str, Enum):
    """Anomaly severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ABTestGoal(str, Enum):
    """A/B test goal metrics"""
    CONVERSION_RATE = "conversion_rate"
    EXECUTION_TIME = "execution_time"
    SUCCESS_RATE = "success_rate"
    USER_ENGAGEMENT = "user_engagement"
    REVENUE = "revenue"
    COST_PER_EXECUTION = "cost_per_execution"


# Request Schemas

class AnalyticsRequest(BaseModel):
    """Request for comprehensive workflow analytics"""
    workflow_id: int
    time_period: AnalyticsTimePeriod = AnalyticsTimePeriod.WEEK
    include_predictions: bool = True
    include_anomalies: bool = True
    include_cost_analysis: bool = True
    custom_metrics: Optional[List[str]] = None

    class Config:
        use_enum_values = True


class WorkflowVariantRequest(BaseModel):
    """Workflow variant configuration for A/B testing"""
    variant_id: str = Field(..., description="Unique identifier for variant")
    variant_name: str = Field(..., description="Human-readable variant name")
    workflow_config: Dict[str, Any] = Field(..., description="Variant-specific configuration")
    traffic_allocation: float = Field(..., ge=0.0, le=1.0, description="Traffic percentage (0.0-1.0)")
    is_control: bool = Field(default=False, description="Whether this is the control variant")
    description: Optional[str] = Field(None, description="Optional variant description")


class ABTestCreateRequest(BaseModel):
    """Request to create a new A/B test experiment"""
    test_name: str = Field(..., min_length=1, max_length=255, description="Test name")
    test_description: Optional[str] = Field(None, description="Test description")
    variants: List[WorkflowVariantRequest] = Field(..., min_items=2, description="Test variants")
    goal_metric: ABTestGoal = Field(..., description="Primary metric to optimize")
    
    # Test parameters
    minimum_sample_size: int = Field(default=1000, ge=100, description="Minimum sample size")
    minimum_detectable_effect: float = Field(default=0.05, ge=0.01, le=0.5, description="Minimum detectable effect")
    significance_level: float = Field(default=0.05, ge=0.01, le=0.10, description="Statistical significance level")
    statistical_power: float = Field(default=0.80, ge=0.70, le=0.95, description="Statistical power")
    max_duration_days: int = Field(default=30, ge=1, le=90, description="Maximum test duration")
    early_stopping_enabled: bool = Field(default=True, description="Enable early stopping")

    @validator('variants')
    def validate_traffic_allocation(cls, v):
        total_traffic = sum(variant.traffic_allocation for variant in v)
        if abs(total_traffic - 1.0) > 0.01:
            raise ValueError(f"Traffic allocation must sum to 1.0, got {total_traffic}")
        return v

    class Config:
        use_enum_values = True


class ExportRequest(BaseModel):
    """Request to export analytics data"""
    format: str = Field(..., regex="^(pdf|csv|json)$", description="Export format")
    time_period: AnalyticsTimePeriod = AnalyticsTimePeriod.MONTH
    include_charts: bool = Field(default=True, description="Include visualizations (PDF only)")
    include_raw_data: bool = Field(default=False, description="Include raw data")
    template: Optional[str] = Field(None, description="Report template name")
    custom_sections: Optional[List[str]] = Field(None, description="Custom report sections")

    class Config:
        use_enum_values = True


# Response Data Models

class PerformanceMetrics(BaseModel):
    """Core performance metrics for workflow analysis"""
    execution_count: int
    success_rate: float = Field(..., ge=0.0, le=1.0)
    avg_execution_time: float
    median_execution_time: float
    p95_execution_time: float
    error_rate: float = Field(..., ge=0.0, le=1.0)
    throughput: float  # executions per hour
    resource_utilization: float = Field(..., ge=0.0, le=1.0)


class ConversionFunnelStage(BaseModel):
    """Individual stage in conversion funnel"""
    stage_name: str
    entry_count: int
    completion_count: int
    conversion_rate: float = Field(..., ge=0.0, le=1.0)
    drop_off_count: int
    avg_time_in_stage: float


class ConversionFunnel(BaseModel):
    """Complete conversion funnel analysis"""
    stages: List[ConversionFunnelStage]
    overall_conversion_rate: float = Field(..., ge=0.0, le=1.0)
    total_drop_offs: int
    optimization_opportunities: List[str]


class BusinessImpactMetrics(BaseModel):
    """Business impact and ROI calculations"""
    time_savings_hours: float
    cost_savings_usd: float
    revenue_attribution_usd: float
    roi_percentage: float
    productivity_improvement: float
    user_satisfaction_score: float = Field(..., ge=0.0, le=100.0)


class PerformanceAnomaly(BaseModel):
    """Detected performance anomaly"""
    timestamp: datetime
    metric_name: str
    actual_value: float
    expected_value: float
    deviation_percentage: float
    severity: AnomalySeverity
    description: str
    suggested_actions: List[str]

    class Config:
        use_enum_values = True


class TrendPrediction(BaseModel):
    """Performance trend prediction"""
    metric_name: str
    current_value: float
    predicted_value: float
    prediction_confidence: float = Field(..., ge=0.0, le=1.0)
    trend_direction: str = Field(..., regex="^(increasing|decreasing|stable)$")
    time_horizon: str
    confidence_interval: tuple[float, float]


class ComprehensiveWorkflowAnalytics(BaseModel):
    """Complete analytics data structure for Story 3.3"""
    workflow_id: int
    workflow_name: str
    time_period: AnalyticsTimePeriod
    analysis_timestamp: datetime
    
    performance_metrics: PerformanceMetrics
    conversion_funnel: ConversionFunnel
    business_impact: BusinessImpactMetrics
    
    detected_anomalies: List[PerformanceAnomaly]
    trend_predictions: List[TrendPrediction]
    
    # Comparison data
    previous_period_comparison: Optional[Dict[str, float]]
    benchmark_comparison: Optional[Dict[str, float]]
    
    # Additional insights
    key_insights: List[str]
    recommendations: List[str]

    class Config:
        use_enum_values = True


class RealTimeMetrics(BaseModel):
    """Real-time performance metrics for dashboard updates"""
    current_executions: int
    success_rate: float = Field(..., ge=0.0, le=1.0)
    avg_response_time: float
    active_users: int
    last_updated: str  # ISO datetime string


class StatisticalSignificance(BaseModel):
    """Statistical significance analysis for A/B tests"""
    is_significant: bool
    p_value: float
    confidence_level: float
    effect_size: float
    statistical_power: float
    sample_size_a: int
    sample_size_b: int
    
    # Test statistics
    test_statistic: float
    degrees_of_freedom: Optional[int]
    test_type: str  # t_test, chi_square, mann_whitney
    
    # Recommendations
    recommendation: str
    confidence_interval: tuple[float, float]


class VariantPerformance(BaseModel):
    """Performance metrics for a specific A/B test variant"""
    variant_id: str
    variant_name: str
    sample_size: int
    conversion_rate: float = Field(..., ge=0.0, le=1.0)
    avg_execution_time: float
    success_rate: float = Field(..., ge=0.0, le=1.0)
    total_conversions: int
    
    # Business metrics
    revenue_per_user: float
    cost_per_conversion: float
    roi_estimate: float
    
    # Confidence intervals
    conversion_rate_ci: tuple[float, float]
    execution_time_ci: tuple[float, float]


class ABTestResult(BaseModel):
    """Complete A/B test results with statistical analysis"""
    test_id: str
    test_name: str
    workflow_id: int
    status: str
    
    # Test configuration
    goal_metric: str
    start_date: datetime
    end_date: Optional[datetime]
    actual_duration_days: int
    
    # Variant performance
    control_performance: VariantPerformance
    treatment_performance: VariantPerformance
    
    # Statistical analysis
    statistical_significance: StatisticalSignificance
    winner_probability: Dict[str, float]  # Probability each variant is best
    expected_improvement: float
    
    # Business impact
    business_impact_estimate: float
    implementation_recommendation: str
    confidence_level: float
    
    # Risk assessment
    risk_factors: List[str]
    implementation_complexity: str  # low, medium, high


# Response Schemas

class AnalyticsResponse(BaseModel):
    """Response for comprehensive analytics request"""
    status: str = "success"
    data: ComprehensiveWorkflowAnalytics
    metadata: Dict[str, Any]
    
    class Config:
        arbitrary_types_allowed = True


class RealTimeMetricsResponse(BaseModel):
    """Response for real-time metrics request"""
    workflow_id: int
    metrics: RealTimeMetrics
    timestamp: str  # ISO datetime string


class ABTestResponse(BaseModel):
    """Response for A/B test creation"""
    status: str = "success"
    test_id: str
    message: str
    test_url: str
    estimated_duration_days: int


class ExportResponse(BaseModel):
    """Response for export request"""
    status: str = "success"
    message: str
    export_id: str
    estimated_completion_time: datetime
    download_url: str


# Error Schemas

class AnalyticsError(BaseModel):
    """Error response for analytics operations"""
    status: str = "error"
    error_code: str
    error_message: str
    error_details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ValidationError(BaseModel):
    """Validation error response"""
    status: str = "validation_error"
    field_errors: List[Dict[str, str]]
    error_message: str


# Utility Schemas

class WorkflowVariant(BaseModel):
    """Workflow variant for internal use"""
    variant_id: str
    variant_name: str
    workflow_config: Dict[str, Any]
    traffic_allocation: float
    is_control: bool = False
    description: Optional[str] = None


class ABTestParameters(BaseModel):
    """A/B test parameters for internal use"""
    test_name: str
    goal_metric: ABTestGoal
    minimum_sample_size: int = 1000
    minimum_detectable_effect: float = 0.05
    significance_level: float = 0.05
    statistical_power: float = 0.80
    max_duration_days: int = 30
    early_stopping_enabled: bool = True

    class Config:
        use_enum_values = True


# Pagination and Filtering

class AnalyticsFilter(BaseModel):
    """Filtering options for analytics data"""
    workflow_ids: Optional[List[int]] = None
    time_range_start: Optional[datetime] = None
    time_range_end: Optional[datetime] = None
    status_filter: Optional[List[str]] = None
    user_ids: Optional[List[int]] = None
    event_types: Optional[List[str]] = None
    anomaly_severity: Optional[List[AnomalySeverity]] = None
    
    class Config:
        use_enum_values = True


class PaginatedAnalyticsResponse(BaseModel):
    """Paginated response for analytics data"""
    items: List[Dict[str, Any]]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


# Configuration Schemas

class DashboardWidget(BaseModel):
    """Configuration for dashboard widget"""
    widget_id: str
    widget_type: str  # chart, metric, table, etc.
    title: str
    position: Dict[str, int]  # x, y, width, height
    configuration: Dict[str, Any]
    refresh_interval: int = 30  # seconds
    data_source: str


class DashboardConfig(BaseModel):
    """Dashboard configuration"""
    dashboard_id: str
    dashboard_name: str
    widgets: List[DashboardWidget]
    layout: str  # grid, flow
    refresh_interval: int = 60  # seconds
    auto_refresh: bool = True
    filters: Optional[AnalyticsFilter] = None


# External Integration Schemas

class ExternalIntegrationConfig(BaseModel):
    """Configuration for external analytics integration"""
    platform: str  # google_analytics, hubspot, salesforce, etc.
    connection_name: str
    api_credentials: Dict[str, str]  # Encrypted in storage
    sync_frequency: str = "daily"  # real_time, hourly, daily, weekly
    metric_mappings: Dict[str, str]
    attribution_window_hours: int = 24
    data_quality_threshold: float = 0.95


class SyncStatus(BaseModel):
    """Sync status for external integration"""
    connection_id: str
    platform: str
    status: str  # success, running, failed, paused
    last_sync: Optional[datetime]
    next_sync: Optional[datetime]
    records_synced: int
    error_message: Optional[str]
    data_quality_score: float