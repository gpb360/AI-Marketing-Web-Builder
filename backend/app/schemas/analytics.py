"""
Analytics API schemas for Story 3.3
Request/response models for performance analytics dashboard.
"""

from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

from app.models.analytics import AnalyticsEventType, MetricAggregationType


class DateRangeFilter(BaseModel):
    """Date range filter for analytics queries."""
    start_date: datetime
    end_date: datetime
    timezone: Optional[str] = "UTC"


class AnalyticsFilter(BaseModel):
    """Common analytics filters."""
    workflow_ids: Optional[List[str]] = None
    user_ids: Optional[List[str]] = None
    event_types: Optional[List[AnalyticsEventType]] = None
    component_ids: Optional[List[str]] = None
    date_range: DateRangeFilter
    
    
class MetricRequest(BaseModel):
    """Request for specific metrics."""
    metric_name: str
    aggregation_type: MetricAggregationType = MetricAggregationType.SUM
    filters: AnalyticsFilter
    group_by: Optional[List[str]] = None  # workflow_id, event_type, date
    

# === Performance Dashboard Schemas ===

class WorkflowPerformanceOverview(BaseModel):
    """High-level workflow performance overview."""
    model_config = ConfigDict(from_attributes=True)
    
    workflow_id: str
    workflow_name: str
    
    # Execution metrics
    total_executions: int
    success_rate: float
    avg_execution_time_ms: float
    
    # Business metrics
    conversion_rate: float
    total_revenue: Decimal
    roi_percentage: float
    
    # Engagement
    unique_users: int
    engagement_score: float
    
    # Trend data (last 30 days)
    execution_trend: List[Dict[str, Any]]
    performance_trend: List[Dict[str, Any]]


class DetailedWorkflowMetrics(BaseModel):
    """Comprehensive workflow analytics."""
    model_config = ConfigDict(from_attributes=True)
    
    # Basic info
    workflow_id: str
    period_start: datetime
    period_end: datetime
    
    # Execution analytics
    execution_metrics: Dict[str, Any] = Field(
        description="Total, successful, failed executions and rates"
    )
    
    # Performance analytics
    performance_metrics: Dict[str, Any] = Field(
        description="Execution times, percentiles, and performance indicators"
    )
    
    # Business analytics
    business_metrics: Dict[str, Any] = Field(
        description="Conversions, revenue, ROI calculations"
    )
    
    # Cost analysis
    cost_metrics: Dict[str, Any] = Field(
        description="Resource costs, time savings, automation value"
    )
    
    # Time-series data
    time_series_data: List[Dict[str, Any]] = Field(
        description="Time-series metrics for charting"
    )


class ConversionFunnelAnalysis(BaseModel):
    """Conversion funnel analysis for workflows."""
    funnel_steps: List[Dict[str, Any]]
    conversion_rates: List[float]
    drop_off_points: List[Dict[str, Any]]
    optimization_suggestions: List[str]


class ROIAnalysis(BaseModel):
    """ROI and cost analysis."""
    total_cost: Decimal
    total_revenue: Decimal
    roi_percentage: float
    cost_breakdown: Dict[str, Decimal]
    time_savings_hours: float
    automation_value: Decimal
    payback_period_days: Optional[int]


# === A/B Testing Schemas ===

class ABTestCreate(BaseModel):
    """Create new A/B test."""
    name: str
    description: Optional[str] = None
    control_workflow_id: str
    variant_workflow_id: str
    traffic_split_percentage: int = Field(ge=1, le=99, default=50)
    confidence_threshold: float = Field(ge=0.8, le=0.99, default=0.95)
    min_sample_size: int = Field(ge=10, default=100)


class ABTestResult(BaseModel):
    """A/B test results."""
    model_config = ConfigDict(from_attributes=True)
    
    test_id: str
    name: str
    status: str
    
    # Test configuration
    control_workflow_id: str
    variant_workflow_id: str
    traffic_split: int
    
    # Results
    control_conversions: int
    control_total: int
    control_conversion_rate: float
    
    variant_conversions: int
    variant_total: int
    variant_conversion_rate: float
    
    # Statistical analysis
    improvement_percentage: float
    statistical_significance: Optional[float]
    confidence_interval: Optional[Dict[str, float]]
    is_significant: bool
    winner_workflow_id: Optional[str]
    
    # Recommendations
    recommendation: str
    next_actions: List[str]


# === Reporting Schemas ===

class ReportTemplate(str, Enum):
    """Available report templates."""
    EXECUTIVE_SUMMARY = "executive_summary"
    WORKFLOW_PERFORMANCE = "workflow_performance"
    ROI_ANALYSIS = "roi_analysis"
    AB_TEST_RESULTS = "ab_test_results"
    CONVERSION_FUNNEL = "conversion_funnel"
    COST_ANALYSIS = "cost_analysis"


class ReportExportRequest(BaseModel):
    """Request to export analytics report."""
    report_type: ReportTemplate
    format: str = Field(regex="^(pdf|csv|excel)$")
    filters: AnalyticsFilter
    include_charts: bool = True
    custom_branding: Optional[Dict[str, str]] = None


class ScheduledReportCreate(BaseModel):
    """Create scheduled report."""
    name: str
    description: Optional[str] = None
    report_type: ReportTemplate
    format: str = Field(regex="^(pdf|csv|excel)$")
    filters: AnalyticsFilter
    schedule_cron: str  # e.g., "0 9 * * MON" for weekly Monday 9 AM
    email_recipients: List[str]
    

class ScheduledReportResponse(BaseModel):
    """Scheduled report configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    report_type: str
    format: str
    schedule_cron: str
    email_recipients: List[str]
    is_active: bool
    last_generated_at: Optional[datetime]
    next_generation_at: Optional[datetime]


# === Real-time Monitoring Schemas ===

class AnomalyDetection(BaseModel):
    """Anomaly detection result."""
    metric_name: str
    current_value: float
    expected_value: float
    deviation_percentage: float
    severity: str  # low, medium, high, critical
    description: str
    suggested_actions: List[str]
    detected_at: datetime


class PerformanceAlert(BaseModel):
    """Performance monitoring alert."""
    alert_id: str
    workflow_id: str
    alert_type: str
    severity: str
    message: str
    metric_values: Dict[str, Any]
    triggered_at: datetime
    acknowledged: bool = False


class RealTimeMetrics(BaseModel):
    """Real-time performance metrics."""
    timestamp: datetime
    active_workflows: int
    total_executions_last_hour: int
    average_execution_time: float
    success_rate_last_hour: float
    alerts_count: int
    
    # Top performing workflows
    top_workflows: List[Dict[str, Any]]
    
    # Recent anomalies
    recent_anomalies: List[AnomalyDetection]


# === External Integration Schemas ===

class ExternalIntegrationCreate(BaseModel):
    """Create external analytics integration."""
    platform: str = Field(regex="^(google_analytics|hubspot|salesforce)$")
    platform_account_id: str
    config: Dict[str, Any]
    field_mappings: Dict[str, str]


class ExternalIntegrationStatus(BaseModel):
    """External integration status."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    platform: str
    platform_account_id: str
    is_active: bool
    last_sync_at: Optional[datetime]
    sync_status: Optional[str]
    next_sync_at: Optional[datetime]


# === Dashboard Schemas ===

class DashboardWidget(BaseModel):
    """Dashboard widget configuration."""
    widget_id: str
    widget_type: str  # chart, metric, table, funnel
    title: str
    position: Dict[str, int]  # x, y, width, height
    config: Dict[str, Any]
    data_source: MetricRequest


class CustomDashboard(BaseModel):
    """Custom dashboard configuration."""
    name: str
    description: Optional[str] = None
    widgets: List[DashboardWidget]
    filters: AnalyticsFilter
    refresh_interval_seconds: int = 300


class DashboardResponse(BaseModel):
    """Dashboard data response."""
    dashboard_config: CustomDashboard
    widget_data: Dict[str, Any]  # widget_id -> data
    last_updated: datetime
    next_refresh: datetime


# === API Response Wrappers ===

class AnalyticsResponse(BaseModel):
    """Standard analytics API response."""
    success: bool = True
    data: Any
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedAnalyticsResponse(BaseModel):
    """Paginated analytics response."""
    items: List[Any]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


# === SLA Remediation Schemas (Story 3.6) ===

class RemediationAction(BaseModel):
    """Individual remediation action."""
    action_type: str
    description: str
    parameters: Dict[str, Any]
    timeout_minutes: int
    rollback_enabled: bool = True


class RemediationStrategy(BaseModel):
    """Remediation strategy definition."""
    model_config = ConfigDict(from_attributes=True)
    
    strategy_id: str
    strategy_name: str
    violation_type: str
    automation_level: str  # fully_automated, semi_automated, manual_approval
    actions: List[RemediationAction]
    success_rate: float
    avg_resolution_time: int  # minutes
    risk_level: str  # low, medium, high
    created_at: datetime
    updated_at: datetime


class RemediationStrategyCreate(BaseModel):
    """Request to create a new remediation strategy."""
    strategy_name: str
    violation_type: str
    automation_level: str
    actions: List[RemediationAction]
    risk_level: str = "medium"


class AuditLogEntry(BaseModel):
    """Audit log entry for remediation execution."""
    timestamp: datetime
    event: str
    details: Dict[str, Any]
    user_id: Optional[str] = None


class RemediationExecution(BaseModel):
    """Remediation execution status and results."""
    model_config = ConfigDict(from_attributes=True)
    
    execution_id: str
    violation_id: str
    strategy_id: str
    status: str  # pending, analyzing, executing, success, failed, escalated, manual_override
    start_time: datetime
    end_time: Optional[datetime] = None
    success: bool
    failure_reason: Optional[str] = None
    actions_completed: List[str]
    rollback_performed: bool = False
    escalation_level: int
    manual_override: bool = False
    audit_log: List[AuditLogEntry]


class RemediationExecutionCreate(BaseModel):
    """Request to create a new remediation execution."""
    violation_id: str
    strategy_id: str
    manual_trigger: bool = False
    force_escalation_level: Optional[int] = None


class RemediationExecutionUpdate(BaseModel):
    """Request to update remediation execution."""
    status: Optional[str] = None
    failure_reason: Optional[str] = None
    escalation_level: Optional[int] = None
    manual_override: Optional[bool] = None


class NotificationTarget(BaseModel):
    """Notification target configuration."""
    target_id: str
    target_type: str  # email, slack, sms, webhook, pagerduty
    address: str
    priority: int = 1


class EscalationAction(BaseModel):
    """Escalation action definition."""
    action_type: str
    description: str
    parameters: Dict[str, Any]
    automatic: bool = True


class EscalationLevel(BaseModel):
    """Escalation level configuration."""
    level: int  # 1, 2, 3
    trigger_conditions: List[str]
    actions: List[EscalationAction]
    timeout_minutes: int
    notification_targets: List[NotificationTarget]
    approval_required: bool = False


class EscalationExecution(BaseModel):
    """Active escalation execution."""
    model_config = ConfigDict(from_attributes=True)
    
    escalation_id: str
    violation_id: str
    escalation_level: int
    trigger: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    notifications_sent: List[Dict[str, Any]]
    actions_completed: List[str]
    escalation_reason: str
    business_impact_score: float


class ManualOverrideRequest(BaseModel):
    """Request for manual override of remediation."""
    action: str  # stop, escalate, retry, rollback
    reason: str
    user_id: str
    force: bool = False


class RootCauseEvidence(BaseModel):
    """Evidence supporting root cause analysis."""
    evidence_type: str
    description: str
    confidence: float
    data: Dict[str, Any]


class ContributingFactor(BaseModel):
    """Contributing factor to violation."""
    factor_type: str
    description: str
    impact_score: float
    data: Dict[str, Any]


class SimilarIncident(BaseModel):
    """Similar historical incident."""
    incident_id: str
    violation_type: str
    similarity_score: float
    resolution_strategy: str
    outcome: str
    resolved_at: datetime


class RemediationRecommendation(BaseModel):
    """Recommended remediation strategy."""
    strategy_id: str
    strategy_name: str
    confidence: float
    estimated_success_rate: float
    estimated_time_minutes: int
    risk_assessment: str


class PreventionSuggestion(BaseModel):
    """Suggestion for preventing future violations."""
    suggestion_type: str
    description: str
    implementation_effort: str  # low, medium, high
    expected_impact: float


class RootCauseAnalysis(BaseModel):
    """ML-powered root cause analysis."""
    violation_id: str
    primary_cause: Dict[str, Any]  # category, confidence, evidence
    contributing_factors: List[ContributingFactor]
    similar_incidents: List[SimilarIncident]
    recommended_remediation: List[RemediationRecommendation]
    prevention_suggestions: List[PreventionSuggestion]


class RootCauseAnalysisResponse(BaseModel):
    """Response containing root cause analysis."""
    analysis: RootCauseAnalysis
    generated_at: datetime
    model_version: str
    processing_time_ms: int


class RemediationHistoryItem(BaseModel):
    """Historical remediation execution summary."""
    date: date
    violation_count: int
    remediation_count: int
    success_count: int
    failure_count: int
    avg_resolution_time: float
    escalation_count: int


class RemediationHistoryResponse(BaseModel):
    """Historical remediation performance data."""
    total_violations: int
    total_remediations: int
    success_rate: float
    avg_resolution_time: float
    escalation_rate: float
    cost_savings_estimate: Optional[float] = None
    history_items: List[RemediationHistoryItem]
    period_start: datetime
    period_end: datetime