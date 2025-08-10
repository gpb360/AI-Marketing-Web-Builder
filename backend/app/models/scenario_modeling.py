"""Scenario modeling models for template configuration optimization."""

from typing import Optional, List, Dict, Any, Union
from sqlalchemy import String, Text, Boolean, JSON, Enum, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import enum

from app.models.base import Base, TimestampMixin, UUIDMixin


class ScenarioType(str, enum.Enum):
    """Types of scenarios for modeling."""
    TRAFFIC_VOLUME = "traffic_volume"
    AUDIENCE_SEGMENT = "audience_segment"
    BUSINESS_GOAL = "business_goal"
    INDUSTRY_CONTEXT = "industry_context"
    SEASONAL_VARIATION = "seasonal_variation"
    COMPETITIVE_LANDSCAPE = "competitive_landscape"
    MARKETING_BUDGET = "marketing_budget"
    TEMPLATE_VARIATION = "template_variation"


class OptimizationObjective(str, enum.Enum):
    """Primary objectives for scenario optimization."""
    CONVERSION_RATE = "conversion_rate"
    REVENUE = "revenue"
    ENGAGEMENT = "engagement"
    LEAD_QUALITY = "lead_quality"
    COST_EFFICIENCY = "cost_efficiency"
    USER_RETENTION = "user_retention"
    BRAND_AWARENESS = "brand_awareness"


class ScenarioModelingConfiguration(Base, TimestampMixin, UUIDMixin):
    """Configuration for scenario modeling experiments."""
    
    __tablename__ = "scenario_modeling_configurations"
    
    # Basic configuration
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    template_id: Mapped[str] = mapped_column(String(100), ForeignKey("templates.id"), nullable=False)
    
    # Scenario parameters
    scenario_type: Mapped[ScenarioType] = mapped_column(Enum(ScenarioType), nullable=False)
    optimization_objective: Mapped[OptimizationObjective] = mapped_column(Enum(OptimizationObjective), nullable=False)
    
    # Configuration variables
    base_configuration: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    variable_parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    constraint_parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Context information
    business_context: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    target_audience: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    industry_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    template: Mapped["Template"] = relationship("Template", back_populates="scenario_configurations")
    scenarios: Mapped[List["ScenarioModel"]] = relationship("ScenarioModel", back_populates="configuration")
    
    def __repr__(self) -> str:
        return f"<ScenarioConfiguration(id={self.id}, name='{self.name}', type='{self.scenario_type}')>"


class ScenarioModel(Base, TimestampMixin, UUIDMixin):
    """Individual scenario model with specific parameter configurations."""
    
    __tablename__ = "scenario_models"
    
    # Basic information
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    configuration_id: Mapped[str] = mapped_column(String(100), ForeignKey("scenario_modeling_configurations.id"), nullable=False)
    
    # Scenario parameters
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    template_modifications: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    context_variables: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Prediction results
    prediction_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float)
    
    # Status and metadata
    is_baseline: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    execution_priority: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    configuration: Mapped["ScenarioModelingConfiguration"] = relationship("ScenarioModelingConfiguration", back_populates="scenarios")
    predictions: Mapped[List["ScenarioPrediction"]] = relationship("ScenarioPrediction", back_populates="scenario")
    
    def __repr__(self) -> str:
        return f"<ScenarioModel(id={self.id}, name='{self.name}', confidence={self.confidence_score})>"


class ScenarioPrediction(Base, TimestampMixin, UUIDMixin):
    """Predictive analytics results for scenario models."""
    
    __tablename__ = "scenario_predictions"
    
    # Basic information
    scenario_id: Mapped[str] = mapped_column(String(100), ForeignKey("scenario_models.id"), nullable=False)
    prediction_type: Mapped[str] = mapped_column(String(100), nullable=False)  # conversion_rate, revenue, etc.
    
    # Prediction results
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_interval_lower: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_interval_upper: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.95)
    
    # Comparison metrics
    baseline_value: Mapped[Optional[float]] = mapped_column(Float)
    improvement_percentage: Mapped[Optional[float]] = mapped_column(Float)
    statistical_significance: Mapped[Optional[float]] = mapped_column(Float)
    
    # Time-based predictions
    prediction_horizon_days: Mapped[int] = mapped_column(Integer, default=30)
    seasonal_adjustment: Mapped[Optional[float]] = mapped_column(Float)
    
    # Model metadata
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0")
    feature_importance: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    
    # Relationships
    scenario: Mapped["ScenarioModel"] = relationship("ScenarioModel", back_populates="predictions")
    
    def __repr__(self) -> str:
        return f"<ScenarioPrediction(id={self.id}, type='{self.prediction_type}', value={self.predicted_value})>"


class OptimizationRecommendation(Base, TimestampMixin, UUIDMixin):
    """AI-generated optimization recommendations based on scenario modeling."""
    
    __tablename__ = "optimization_recommendations"
    
    # Basic information
    configuration_id: Mapped[str] = mapped_column(String(100), ForeignKey("scenario_modeling_configurations.id"), nullable=False)
    recommendation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0)  # Higher = more important
    
    # Recommendation details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Implementation details
    implementation_steps: Mapped[List[str]] = mapped_column(JSON, default=list)
    estimated_effort_hours: Mapped[Optional[float]] = mapped_column(Float)
    required_resources: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Impact predictions
    expected_impact: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    risk_assessment: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    success_probability: Mapped[float] = mapped_column(Float, default=0.5)
    
    # Status tracking
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, approved, implemented, rejected
    user_feedback: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    
    # Relationships
    configuration: Mapped["ScenarioModelingConfiguration"] = relationship("ScenarioModelingConfiguration")
    
    def __repr__(self) -> str:
        return f"<OptimizationRecommendation(id={self.id}, title='{self.title}', priority={self.priority})>"


class ScenarioExperiment(Base, TimestampMixin, UUIDMixin):
    """Real-world experiments based on scenario model predictions."""
    
    __tablename__ = "scenario_experiments"
    
    # Basic information
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    scenario_id: Mapped[str] = mapped_column(String(100), ForeignKey("scenario_models.id"), nullable=False)
    
    # Experiment configuration
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(50), default="planned")  # planned, running, completed, paused, cancelled
    
    # Experimental design
    hypothesis: Mapped[str] = mapped_column(Text, nullable=False)
    success_metrics: Mapped[List[str]] = mapped_column(JSON, default=list)
    sample_size: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Results
    actual_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    prediction_accuracy: Mapped[Optional[float]] = mapped_column(Float)
    lessons_learned: Mapped[Optional[str]] = mapped_column(Text)
    
    # Relationships
    scenario: Mapped["ScenarioModel"] = relationship("ScenarioModel")
    
    def __repr__(self) -> str:
        return f"<ScenarioExperiment(id={self.id}, name='{self.name}', status='{self.status}')>"