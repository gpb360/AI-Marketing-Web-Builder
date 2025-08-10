"""
Pydantic schemas for template performance analysis API.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator

from app.models.analytics import PerformanceBand, MetricType


class PerformanceMetrics(BaseModel):
    """Core performance metrics schema."""
    total_page_views: int = Field(..., description="Total page views in period")
    total_sessions: int = Field(..., description="Total user sessions")
    total_conversions: int = Field(..., description="Total conversions")
    conversion_rate: float = Field(..., ge=0, le=1, description="Conversion rate (0-1)")
    bounce_rate: float = Field(..., ge=0, le=1, description="Bounce rate (0-1)")
    avg_session_duration: float = Field(..., ge=0, description="Average session duration in seconds")
    avg_page_load_time: float = Field(..., ge=0, description="Average page load time in seconds")
    
    # Usage metrics
    total_usage: int = Field(..., description="Total template usage instances")
    success_rate: float = Field(..., ge=0, le=1, description="Usage success rate")
    workflow_success_rate: float = Field(..., ge=0, le=1, description="Workflow completion rate")
    avg_satisfaction: float = Field(..., ge=0, le=5, description="Average user satisfaction (1-5)")
    
    # Traffic analysis
    traffic_sources: Dict[str, int] = Field(..., description="Traffic by source")
    device_distribution: Dict[str, Any] = Field(..., description="Device usage distribution")
    
    # Engagement
    avg_scroll_depth: float = Field(..., ge=0, le=1, description="Average scroll depth (0-1)")
    form_completion_rate: float = Field(..., ge=0, le=1, description="Form completion rate")
    
    # Data quality indicators
    data_points: int = Field(..., description="Number of data points in analysis")
    date_range_coverage: float = Field(..., ge=0, le=1, description="Coverage of date range")


class PerformanceScores(BaseModel):
    """Performance scoring schema."""
    overall_score: float = Field(..., ge=0, le=100, description="Overall performance score (0-100)")
    conversion_score: float = Field(..., ge=0, le=100, description="Conversion performance score")
    ux_score: float = Field(..., ge=0, le=100, description="User experience score")
    engagement_score: float = Field(..., ge=0, le=100, description="Engagement score")
    success_score: float = Field(..., ge=0, le=100, description="Success rate score")


class AIInsights(BaseModel):
    """AI-generated insights schema."""
    performance_analysis: Dict[str, Any] = Field(..., description="SWOT-style performance analysis")
    optimization_recommendations: List[Dict[str, Any]] = Field(..., description="Optimization recommendations")
    technical_improvements: List[Dict[str, Any]] = Field(..., description="Technical improvement suggestions")
    content_suggestions: List[Dict[str, Any]] = Field(..., description="Content optimization suggestions")
    priority_actions: List[Dict[str, Any]] = Field(..., description="Top priority actions")


class TemplateInfo(BaseModel):
    """Basic template information schema."""
    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    category: str = Field(..., description="Template category")
    status: str = Field(..., description="Template status")
    created_at: datetime = Field(..., description="Template creation date")


class TemplateRankingResponse(BaseModel):
    """Template ranking response schema."""
    template_id: str = Field(..., description="Template ID")
    template_info: Optional[TemplateInfo] = Field(None, description="Template basic information")
    
    # Ranking information
    overall_rank: int = Field(..., ge=1, description="Overall ranking position")
    category_rank: int = Field(..., ge=1, description="Ranking within category")
    performance_band: PerformanceBand = Field(..., description="Performance band classification")
    
    # Scores
    overall_score: float = Field(..., ge=0, le=100, description="Overall performance score")
    performance_score: float = Field(..., ge=0, le=100, description="Performance-specific score")
    popularity_score: float = Field(..., ge=0, le=100, description="Popularity score")
    quality_score: float = Field(..., ge=0, le=100, description="Quality score")
    success_score: float = Field(..., ge=0, le=100, description="Success rate score")
    
    # Trends
    rank_change_7d: int = Field(..., description="Rank change over 7 days")
    rank_change_30d: int = Field(..., description="Rank change over 30 days")
    score_change_7d: float = Field(..., description="Score change over 7 days")
    score_change_30d: float = Field(..., description="Score change over 30 days")
    
    # Metrics
    avg_conversion_rate: float = Field(..., ge=0, le=1, description="Average conversion rate")
    avg_bounce_rate: float = Field(..., ge=0, le=1, description="Average bounce rate")
    avg_session_duration: float = Field(..., ge=0, description="Average session duration")
    total_usage: int = Field(..., description="Total usage count")
    success_rate: float = Field(..., ge=0, le=1, description="Success rate")
    
    # User feedback
    avg_rating: float = Field(..., ge=0, le=5, description="Average user rating")
    rating_count: int = Field(..., description="Number of ratings")
    recommendation_rate: float = Field(..., ge=0, le=1, description="User recommendation rate")
    
    # Analysis metadata
    last_analyzed_at: datetime = Field(..., description="Last analysis timestamp")
    analysis_version: int = Field(..., description="Analysis version number")
    
    class Config:
        from_attributes = True


class TemplateRankingListResponse(BaseModel):
    """Template rankings list response schema."""
    rankings: List[TemplateRankingResponse] = Field(..., description="List of template rankings")
    total: int = Field(..., description="Total number of rankings returned")
    limit: int = Field(..., description="Limit applied to results")
    offset: int = Field(..., description="Offset applied to results")
    filters: Dict[str, Any] = Field(..., description="Applied filters")


class DateRange(BaseModel):
    """Date range schema."""
    start: datetime = Field(..., description="Start date of analysis")
    end: datetime = Field(..., description="End date of analysis")
    days: int = Field(..., ge=1, description="Number of days in range")


class TemplatePerformanceAnalysisResponse(BaseModel):
    """Complete template performance analysis response schema."""
    success: bool = Field(..., description="Analysis success status")
    template_id: str = Field(..., description="Analyzed template ID")
    analysis_date: datetime = Field(..., description="Analysis execution timestamp")
    date_range: DateRange = Field(..., description="Analysis date range")
    
    performance_metrics: PerformanceMetrics = Field(..., description="Detailed performance metrics")
    performance_scores: PerformanceScores = Field(..., description="Performance scores")
    insights: AIInsights = Field(..., description="AI-generated insights and recommendations")
    
    ranking_updated: bool = Field(..., description="Whether ranking was updated")
    
    error: Optional[str] = Field(None, description="Error message if analysis failed")


class OptimizationRecommendationResponse(BaseModel):
    """Optimization recommendation response schema."""
    id: str = Field(..., description="Recommendation ID")
    template_id: str = Field(..., description="Template ID")
    
    # Recommendation details
    recommendation_type: str = Field(..., description="Type of recommendation")
    priority: str = Field(..., description="Recommendation priority level")
    status: str = Field(..., description="Implementation status")
    
    # Content
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    implementation_steps: List[str] = Field(..., description="Step-by-step implementation guide")
    
    # Impact predictions
    estimated_improvement: Optional[float] = Field(None, description="Estimated improvement percentage")
    confidence_score: float = Field(..., ge=0, le=1, description="AI confidence score")
    impact_area: str = Field(..., description="Primary impact area")
    
    # Implementation details
    effort_level: str = Field(..., description="Implementation effort required")
    estimated_time_hours: Optional[int] = Field(None, description="Estimated implementation time")
    required_skills: List[str] = Field(..., description="Required skills for implementation")
    
    # Tracking
    was_applied: bool = Field(..., description="Whether recommendation was applied")
    applied_at: Optional[datetime] = Field(None, description="Application timestamp")
    actual_improvement: Optional[float] = Field(None, description="Actual improvement achieved")
    
    # Metadata
    created_at: datetime = Field(..., description="Recommendation creation timestamp")
    analysis_version: int = Field(..., description="Analysis version that generated this")
    
    class Config:
        from_attributes = True


class BenchmarkData(BaseModel):
    """Benchmark comparison data schema."""
    category_average_conversion: float = Field(..., description="Category average conversion rate")
    category_average_bounce: float = Field(..., description="Category average bounce rate")
    category_average_session: float = Field(..., description="Category average session duration")
    industry_percentile: Optional[float] = Field(None, description="Industry percentile ranking")
    
    comparison: Dict[str, str] = Field(default_factory=dict, description="Performance vs benchmarks")


class OptimizationOpportunity(BaseModel):
    """Optimization opportunity schema."""
    type: str = Field(..., description="Opportunity type")
    priority: str = Field(..., description="Priority level")
    description: str = Field(..., description="Opportunity description")
    estimated_impact: str = Field(..., description="Estimated impact description")
    effort_required: str = Field(default="medium", description="Effort level required")


class PerformanceDashboardResponse(BaseModel):
    """Comprehensive performance dashboard response schema."""
    template_id: str = Field(..., description="Template ID")
    analysis_date: datetime = Field(..., description="Dashboard generation timestamp")
    date_range: DateRange = Field(..., description="Analysis period")
    
    # Core data
    performance_metrics: PerformanceMetrics = Field(..., description="Performance metrics")
    performance_scores: PerformanceScores = Field(..., description="Performance scores")
    ranking_info: Optional[TemplateRankingResponse] = Field(None, description="Current ranking information")
    
    # Analysis and insights
    insights: AIInsights = Field(..., description="AI insights and recommendations")
    benchmarks: BenchmarkData = Field(..., description="Benchmark comparison data")
    optimization_opportunities: List[OptimizationOpportunity] = Field(..., description="Optimization opportunities")
    
    # Trends (would be populated with historical data)
    trend_indicators: Dict[str, Any] = Field(default_factory=dict, description="Performance trend indicators")


class RankingTrendDataPoint(BaseModel):
    """Single ranking trend data point schema."""
    date: datetime = Field(..., description="Data point date")
    overall_rank: int = Field(..., description="Overall ranking position")
    category_rank: int = Field(..., description="Category ranking position")
    overall_score: float = Field(..., description="Overall performance score")
    conversion_rate: float = Field(..., description="Conversion rate at this point")


class RankingTrendSummary(BaseModel):
    """Ranking trend summary schema."""
    direction: str = Field(..., description="Trend direction (up, down, stable)")
    change_percentage: float = Field(..., description="Overall change percentage")
    peak_rank: int = Field(..., description="Best ranking achieved in period")
    current_rank: int = Field(..., description="Current ranking position")
    volatility: str = Field(default="low", description="Ranking volatility (low, medium, high)")


class RankingTrendResponse(BaseModel):
    """Ranking trend response schema."""
    template_id: str = Field(..., description="Template ID")
    period_days: int = Field(..., description="Analysis period in days")
    
    trend_data: List[RankingTrendDataPoint] = Field(..., description="Historical trend data points")
    summary: RankingTrendSummary = Field(..., description="Trend summary")
    
    # Key insights
    key_events: List[Dict[str, Any]] = Field(default_factory=list, description="Notable ranking events")
    improvement_periods: List[Dict[str, Any]] = Field(default_factory=list, description="Periods of improvement")
    decline_periods: List[Dict[str, Any]] = Field(default_factory=list, description="Periods of decline")


# Validation helpers
class TemplatePerformanceAnalysisRequest(BaseModel):
    """Template performance analysis request schema."""
    template_id: str = Field(..., description="Template ID to analyze")
    date_range_days: int = Field(30, ge=1, le=365, description="Analysis period in days")
    force_refresh: bool = Field(False, description="Force fresh analysis ignoring cache")
    include_ai_insights: bool = Field(True, description="Include AI-generated insights")
    include_recommendations: bool = Field(True, description="Generate optimization recommendations")
    
    @validator('template_id')
    def validate_template_id(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Template ID cannot be empty')
        return v.strip()


class BulkAnalysisRequest(BaseModel):
    """Bulk analysis request schema."""
    template_ids: Optional[List[str]] = Field(None, description="Specific template IDs to analyze")
    category: Optional[str] = Field(None, description="Analyze all templates in category")
    force_refresh: bool = Field(False, description="Force fresh analysis for all templates")
    priority: str = Field("normal", description="Analysis priority (low, normal, high)")
    
    @validator('template_ids')
    def validate_template_ids(cls, v):
        if v is not None and len(v) == 0:
            raise ValueError('Template IDs list cannot be empty if provided')
        return v


class AnalysisStatusResponse(BaseModel):
    """Analysis status response schema."""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Status message")
    scheduled_at: Optional[str] = Field(None, description="Scheduling information")
    analysis_id: Optional[str] = Field(None, description="Analysis job ID for tracking")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")