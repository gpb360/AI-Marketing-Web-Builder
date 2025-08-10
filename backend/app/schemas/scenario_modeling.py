"""Scenario modeling schemas for API request/response validation."""

from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, ConfigDict, validator
from datetime import datetime
from enum import Enum

from app.models.scenario_modeling import ScenarioType, OptimizationObjective


# Request Schemas
class ScenarioModelingRequest(BaseModel):
    """Request schema for creating scenario modeling configuration."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    template_id: str = Field(..., min_length=1)
    scenario_type: ScenarioType
    optimization_objective: OptimizationObjective
    
    # Configuration parameters
    base_configuration: Dict[str, Any] = Field(default_factory=dict)
    variable_parameters: Dict[str, Any] = Field(default_factory=dict)
    constraint_parameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Context information
    business_context: Dict[str, Any] = Field(default_factory=dict)
    target_audience: Dict[str, Any] = Field(default_factory=dict)
    industry_data: Dict[str, Any] = Field(default_factory=dict)


class ScenarioGenerationRequest(BaseModel):
    """Request schema for generating multiple scenarios."""
    configuration_id: str = Field(..., min_length=1)
    number_of_scenarios: int = Field(default=5, ge=1, le=20)
    scenario_diversity: float = Field(default=0.7, ge=0.0, le=1.0)
    include_baseline: bool = Field(default=True)
    optimization_focus: List[str] = Field(default_factory=list)


class ScenarioPredictionRequest(BaseModel):
    """Request schema for generating predictions for scenarios."""
    scenario_ids: List[str] = Field(..., min_items=1)
    prediction_types: List[str] = Field(
        default=["conversion_rate", "revenue", "engagement"],
        min_items=1
    )
    prediction_horizon_days: int = Field(default=30, ge=1, le=365)
    confidence_level: float = Field(default=0.95, ge=0.5, le=0.99)
    include_feature_importance: bool = Field(default=True)


class OptimizationRequest(BaseModel):
    """Request schema for generating optimization recommendations."""
    configuration_id: str = Field(..., min_length=1)
    max_recommendations: int = Field(default=10, ge=1, le=50)
    minimum_impact_threshold: float = Field(default=0.05, ge=0.0, le=1.0)
    effort_constraint: Optional[str] = Field(default=None)  # low, medium, high
    risk_tolerance: float = Field(default=0.5, ge=0.0, le=1.0)


# Response Schemas
class ScenarioModelResponse(BaseModel):
    """Response schema for scenario models."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    description: Optional[str]
    parameters: Dict[str, Any]
    template_modifications: Dict[str, Any]
    context_variables: Dict[str, Any]
    prediction_results: Optional[Dict[str, Any]]
    confidence_score: Optional[float]
    is_baseline: bool
    is_active: bool
    execution_priority: int
    created_at: datetime
    updated_at: Optional[datetime]


class ScenarioPredictionResponse(BaseModel):
    """Response schema for scenario predictions."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    scenario_id: str
    prediction_type: str
    predicted_value: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    confidence_level: float
    baseline_value: Optional[float]
    improvement_percentage: Optional[float]
    statistical_significance: Optional[float]
    prediction_horizon_days: int
    seasonal_adjustment: Optional[float]
    model_version: str
    feature_importance: Optional[Dict[str, Any]]
    created_at: datetime


class OptimizationRecommendationResponse(BaseModel):
    """Response schema for optimization recommendations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    recommendation_type: str
    priority: int
    title: str
    description: str
    rationale: str
    implementation_steps: List[str]
    estimated_effort_hours: Optional[float]
    required_resources: List[str]
    expected_impact: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    success_probability: float
    status: str
    created_at: datetime


class ScenarioModelingConfigurationResponse(BaseModel):
    """Response schema for scenario modeling configuration."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    description: Optional[str]
    template_id: str
    scenario_type: ScenarioType
    optimization_objective: OptimizationObjective
    base_configuration: Dict[str, Any]
    variable_parameters: Dict[str, Any]
    constraint_parameters: Dict[str, Any]
    business_context: Dict[str, Any]
    target_audience: Dict[str, Any]
    industry_data: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Computed fields
    scenarios_count: Optional[int] = None
    active_scenarios_count: Optional[int] = None
    latest_prediction_date: Optional[datetime] = None


class ScenarioComparisonResponse(BaseModel):
    """Response schema for scenario comparison analysis."""
    configuration_id: str
    comparison_type: str
    scenarios: List[ScenarioModelResponse]
    predictions: List[ScenarioPredictionResponse]
    
    # Comparison metrics
    best_performing_scenario: Optional[str] = None
    performance_ranking: List[Dict[str, Any]] = Field(default_factory=list)
    statistical_significance_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    
    # Insights
    key_insights: List[str] = Field(default_factory=list)
    recommended_scenario: Optional[str] = None
    confidence_in_recommendation: Optional[float] = None


class ScenarioSimulationRequest(BaseModel):
    """Request schema for real-time scenario simulation."""
    template_id: str = Field(..., min_length=1)
    modifications: Dict[str, Any] = Field(default_factory=dict)
    
    # Context for simulation
    business_context: Dict[str, Any] = Field(default_factory=dict)
    target_audience: Dict[str, Any] = Field(default_factory=dict)
    market_conditions: Dict[str, Any] = Field(default_factory=dict)
    
    # Simulation parameters
    simulation_duration_days: int = Field(default=30, ge=1, le=365)
    sample_size: int = Field(default=1000, ge=100, le=100000)
    monte_carlo_runs: int = Field(default=1000, ge=100, le=10000)


class ScenarioSimulationResponse(BaseModel):
    """Response schema for scenario simulation results."""
    simulation_id: str
    template_id: str
    modifications: Dict[str, Any]
    
    # Simulation results
    predicted_outcomes: Dict[str, Any]
    confidence_intervals: Dict[str, Dict[str, float]]
    risk_metrics: Dict[str, float]
    
    # Comparison with baseline
    baseline_comparison: Dict[str, float]
    improvement_probability: float
    
    # Detailed analysis
    sensitivity_analysis: Dict[str, float]
    scenario_robustness: float
    implementation_complexity: str  # low, medium, high
    
    # Metadata
    simulation_parameters: Dict[str, Any]
    computation_time_seconds: float
    created_at: datetime


class HistoricalPerformanceRequest(BaseModel):
    """Request schema for historical performance analysis."""
    template_ids: List[str] = Field(..., min_items=1)
    date_range_start: datetime
    date_range_end: datetime
    metrics: List[str] = Field(
        default=["conversion_rate", "engagement", "revenue"],
        min_items=1
    )
    aggregation_level: str = Field(default="daily")  # hourly, daily, weekly, monthly
    include_external_factors: bool = Field(default=True)


class HistoricalPerformanceResponse(BaseModel):
    """Response schema for historical performance data."""
    template_ids: List[str]
    date_range_start: datetime
    date_range_end: datetime
    
    # Performance data
    performance_data: Dict[str, List[Dict[str, Any]]]
    aggregated_metrics: Dict[str, Dict[str, float]]
    
    # Trends and patterns
    trend_analysis: Dict[str, str]  # improving, declining, stable
    seasonal_patterns: Dict[str, List[float]]
    correlation_matrix: Dict[str, Dict[str, float]]
    
    # Insights
    performance_insights: List[str]
    anomaly_detection: List[Dict[str, Any]]
    
    # Metadata
    data_quality_score: float
    created_at: datetime


# Complex Analysis Schemas
class MultiDimensionalAnalysisRequest(BaseModel):
    """Request for multi-dimensional scenario analysis."""
    configuration_id: str = Field(..., min_length=1)
    dimensions: List[str] = Field(..., min_items=2)  # industry, audience, goals, etc.
    interaction_effects: bool = Field(default=True)
    max_combinations: int = Field(default=100, ge=10, le=1000)
    

class MultiDimensionalAnalysisResponse(BaseModel):
    """Response for multi-dimensional analysis results."""
    configuration_id: str
    dimensions_analyzed: List[str]
    
    # Analysis results
    dimension_effects: Dict[str, Dict[str, float]]
    interaction_effects: Dict[str, float]
    optimal_combinations: List[Dict[str, Any]]
    
    # Performance insights
    top_performing_combinations: List[Dict[str, Any]]
    dimension_importance_ranking: List[Dict[str, float]]
    
    # Recommendations
    configuration_recommendations: List[Dict[str, Any]]
    next_experiments: List[Dict[str, Any]]
    
    created_at: datetime