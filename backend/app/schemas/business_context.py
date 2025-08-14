"""
Business context schemas for context-aware template recommendations.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from datetime import datetime


class IndustryType(str, Enum):
    """Industry types for business context analysis."""
    TECHNOLOGY = "technology"
    HEALTHCARE = "healthcare"
    FINANCE = "finance"
    EDUCATION = "education"
    RETAIL = "retail"
    RESTAURANT = "restaurant"
    REAL_ESTATE = "real_estate"
    CONSULTING = "consulting"
    MARKETING = "marketing"
    NONPROFIT = "nonprofit"
    MANUFACTURING = "manufacturing"
    LEGAL = "legal"
    FITNESS = "fitness"
    BEAUTY = "beauty"
    TRAVEL = "travel"
    AUTOMOTIVE = "automotive"
    ENTERTAINMENT = "entertainment"
    AGRICULTURE = "agriculture"
    CONSTRUCTION = "construction"
    OTHER = "other"


class CompanySize(str, Enum):
    """Company size categories."""
    STARTUP = "startup"  # 1-10 employees
    SMALL = "small"      # 11-50 employees
    MEDIUM = "medium"    # 51-200 employees
    LARGE = "large"      # 201-1000 employees
    ENTERPRISE = "enterprise"  # 1000+ employees


class BusinessGoal(str, Enum):
    """Primary business goals."""
    LEAD_GENERATION = "lead_generation"
    BRAND_AWARENESS = "brand_awareness"
    ONLINE_SALES = "online_sales"
    CUSTOMER_SUPPORT = "customer_support"
    PORTFOLIO_SHOWCASE = "portfolio_showcase"
    CONTENT_MARKETING = "content_marketing"
    COMMUNITY_BUILDING = "community_building"
    EVENT_PROMOTION = "event_promotion"
    RECRUITING = "recruiting"
    INVESTOR_RELATIONS = "investor_relations"


class TargetAudience(str, Enum):
    """Target audience types."""
    B2B = "b2b"
    B2C = "b2c"
    B2B2C = "b2b2c"
    INTERNAL = "internal"
    MIXED = "mixed"


class BusinessContext(BaseModel):
    """Business context for template recommendations."""
    
    # Company information
    company_name: Optional[str] = Field(None, max_length=200)
    industry: IndustryType
    company_size: CompanySize
    target_audience: TargetAudience
    
    # Business goals and requirements
    primary_goals: List[BusinessGoal] = Field(default_factory=list, max_items=5)
    secondary_goals: List[BusinessGoal] = Field(default_factory=list, max_items=3)
    
    # Technical requirements
    required_features: List[str] = Field(default_factory=list, max_items=10)
    preferred_style: Optional[str] = Field(None, max_length=100)
    color_preferences: List[str] = Field(default_factory=list, max_items=5)
    
    # Additional context
    existing_website: Optional[str] = Field(None, max_length=500)
    competitor_websites: List[str] = Field(default_factory=list, max_items=5)
    brand_keywords: List[str] = Field(default_factory=list, max_items=10)
    
    # Budget and timeline
    budget_range: Optional[str] = Field(None, max_length=50)
    timeline: Optional[str] = Field(None, max_length=100)
    
    # Custom fields for additional context
    custom_requirements: Dict[str, Any] = Field(default_factory=dict)


class ContextAnalysisRequest(BaseModel):
    """Request schema for context analysis."""
    
    business_context: BusinessContext
    user_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    include_analytics: bool = Field(default=True)
    max_recommendations: int = Field(default=10, ge=1, le=50)


class TemplateScore(BaseModel):
    """Template scoring result."""
    
    template_id: int
    template_name: str
    overall_score: float = Field(..., ge=0.0, le=1.0)
    
    # Score breakdown
    industry_match_score: float = Field(..., ge=0.0, le=1.0)
    goal_alignment_score: float = Field(..., ge=0.0, le=1.0)
    feature_match_score: float = Field(..., ge=0.0, le=1.0)
    style_preference_score: float = Field(..., ge=0.0, le=1.0)
    success_pattern_score: float = Field(..., ge=0.0, le=1.0)
    
    # Explanation
    match_reasons: List[str] = Field(default_factory=list)
    potential_concerns: List[str] = Field(default_factory=list)
    customization_suggestions: List[str] = Field(default_factory=list)


class TemplateRecommendation(BaseModel):
    """Template recommendation with context analysis."""
    
    template_id: int
    template_name: str
    template_category: str
    template_description: Optional[str]
    preview_image: Optional[str]
    demo_url: Optional[str]
    
    # Scoring and ranking
    recommendation_score: float = Field(..., ge=0.0, le=1.0)
    ranking: int = Field(..., ge=1)
    confidence_level: float = Field(..., ge=0.0, le=1.0)
    
    # Analysis results
    score_breakdown: TemplateScore
    ai_analysis: Dict[str, Any] = Field(default_factory=dict)
    
    # Success metrics
    similar_business_success_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    estimated_conversion_uplift: Optional[float] = Field(None, ge=0.0)
    
    # Customization guidance
    recommended_modifications: List[str] = Field(default_factory=list)
    workflow_suggestions: List[str] = Field(default_factory=list)


class ContextAnalysisResult(BaseModel):
    """Complete context analysis result."""
    
    # Request context
    analysis_id: str
    business_context: BusinessContext
    analysis_timestamp: datetime
    
    # Analysis results
    industry_insights: Dict[str, Any] = Field(default_factory=dict)
    goal_analysis: Dict[str, Any] = Field(default_factory=dict)
    competitive_analysis: Dict[str, Any] = Field(default_factory=dict)
    
    # Template recommendations
    recommended_templates: List[TemplateRecommendation] = Field(default_factory=list)
    alternative_templates: List[TemplateRecommendation] = Field(default_factory=list)
    
    # AI insights
    ai_summary: str
    success_prediction: Dict[str, Any] = Field(default_factory=dict)
    optimization_opportunities: List[str] = Field(default_factory=list)
    
    # Performance metrics
    analysis_confidence: float = Field(..., ge=0.0, le=1.0)
    processing_time_ms: int = Field(..., ge=0)


class BusinessAnalysisRequest(BaseModel):
    """Request schema for business analysis."""
    
    industry: IndustryType
    company_size: CompanySize
    target_audience: TargetAudience
    primary_goals: List[BusinessGoal]
    
    # Optional context
    existing_performance_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    competitor_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)
    market_research: Optional[Dict[str, Any]] = Field(default_factory=dict)


class IndustryInsights(BaseModel):
    """Industry-specific insights and recommendations."""
    
    industry: IndustryType
    
    # Market analysis
    market_trends: List[str] = Field(default_factory=list)
    key_success_factors: List[str] = Field(default_factory=list)
    common_challenges: List[str] = Field(default_factory=list)
    
    # Template preferences
    preferred_template_categories: List[str] = Field(default_factory=list)
    popular_features: List[str] = Field(default_factory=list)
    design_preferences: Dict[str, Any] = Field(default_factory=dict)
    
    # Performance benchmarks
    average_conversion_rates: Dict[str, float] = Field(default_factory=dict)
    typical_engagement_metrics: Dict[str, float] = Field(default_factory=dict)
    
    # AI recommendations
    recommended_strategies: List[str] = Field(default_factory=list)
    optimization_priorities: List[str] = Field(default_factory=list)


class BusinessAnalysisResult(BaseModel):
    """Complete business analysis result."""
    
    # Request context
    analysis_id: str
    request_data: BusinessAnalysisRequest
    analysis_timestamp: datetime
    
    # Industry analysis
    industry_insights: IndustryInsights
    competitive_landscape: Dict[str, Any] = Field(default_factory=dict)
    market_opportunities: List[str] = Field(default_factory=list)
    
    # Goal analysis
    goal_feasibility_analysis: Dict[str, Any] = Field(default_factory=dict)
    recommended_kpis: List[str] = Field(default_factory=list)
    success_timeline_estimate: Dict[str, str] = Field(default_factory=dict)
    
    # Template strategy
    template_strategy: Dict[str, Any] = Field(default_factory=dict)
    feature_prioritization: List[str] = Field(default_factory=list)
    content_strategy: Dict[str, Any] = Field(default_factory=dict)
    
    # AI insights
    ai_recommendations: List[str] = Field(default_factory=list)
    risk_assessment: Dict[str, Any] = Field(default_factory=dict)
    
    # Confidence metrics
    analysis_confidence: float = Field(..., ge=0.0, le=1.0)
    data_quality_score: float = Field(..., ge=0.0, le=1.0)