"""Database models for the AI Web Builder Platform."""

from .base import BaseModel, TimestampMixin
from .user import User
from .sites import Site, Component
from .workflow import Workflow, WorkflowExecution, WorkflowNode
from .crm import Contact, ContactActivity, EmailCampaign, EmailSend
from .template import Template, TemplateComponent
from .analytics import (
    TemplateAnalytics, 
    TemplateRanking, 
    ConversionEvent, 
    TemplateUsage, 
    TemplateOptimizationRecommendation,
    MetricType,
    PerformanceBand,
    RecommendationEvent,
    ABTestMetrics,
    RecommendationAlgorithm,
    UserInteraction,
    EventType
)
from .ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestType
from .scenario_modeling import (
    ScenarioModelingConfiguration,
    ScenarioModel,
    ScenarioPrediction,
    OptimizationRecommendation,
    ScenarioExperiment,
    ScenarioType,
    OptimizationObjective
)

__all__ = [
    "BaseModel",
    "TimestampMixin",
    "User",
    "Site",
    "Component", 
    "Template",
    "TemplateComponent",
    "Workflow",
    "WorkflowExecution",
    "WorkflowNode",
    "Contact",
    "ContactActivity",
    "EmailCampaign",
    "EmailSend",
    "TemplateAnalytics",
    "TemplateRanking",
    "ConversionEvent",
    "TemplateUsage",
    "TemplateOptimizationRecommendation",
    "MetricType",
    "PerformanceBand",
    "RecommendationEvent",
    "ABTestMetrics",
    "RecommendationAlgorithm",
    "UserInteraction",
    "EventType",
    "ABTest",
    "ABTestVariant",
    "ABTestStatus",
    "ABTestType",
    "ScenarioModelingConfiguration",
    "ScenarioModel",
    "ScenarioPrediction",
    "OptimizationRecommendation",
    "ScenarioExperiment",
    "ScenarioType",
    "OptimizationObjective",
]