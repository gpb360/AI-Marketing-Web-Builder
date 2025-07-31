"""
AI template generation schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.template import TemplateCategory


class AITemplateGenerateRequest(BaseModel):
    """Request schema for AI template generation."""
    description: str = Field(..., min_length=10, max_length=1000, description="Natural language description of desired template")
    category: TemplateCategory = Field(..., description="Template category")
    style_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Style and layout preferences")
    target_audience: Optional[str] = Field(None, max_length=200, description="Target audience description")
    industry: Optional[str] = Field(None, max_length=100, description="Target industry/business type")
    brand_colors: Optional[List[str]] = Field(default_factory=list, description="Brand color palette (hex codes)")
    brand_fonts: Optional[List[str]] = Field(default_factory=list, description="Preferred font families")


class AITemplateGenerateResponse(BaseModel):
    """Response schema for AI template generation."""
    success: bool
    template: Optional[Dict[str, Any]] = None
    components_count: int = 0
    generation_time: float
    optimization_queued: bool
    error: Optional[str] = None


class AITemplateOptimizeRequest(BaseModel):
    """Request schema for AI template optimization."""
    template_id: int = Field(..., description="Template ID to optimize")
    target_metrics: Dict[str, Any] = Field(default_factory=dict, description="Target conversion metrics")
    optimization_goals: Optional[List[str]] = Field(default_factory=list, description="Specific optimization goals")
    constraints: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optimization constraints")


class AITemplateOptimizeResponse(BaseModel):
    """Response schema for AI template optimization."""
    success: bool
    template_id: int
    suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    a_b_test_variants: List[Dict[str, Any]] = Field(default_factory=list)
    performance_predictions: Dict[str, Any] = Field(default_factory=dict)
    priority_changes: List[Dict[str, Any]] = Field(default_factory=list)
    error: Optional[str] = None


class AITemplateVariantsRequest(BaseModel):
    """Request schema for AI template variant generation."""
    base_template_id: int = Field(..., description="Base template ID")
    variant_count: int = Field(default=3, ge=1, le=10, description="Number of variants to generate")
    variation_type: str = Field(default="aesthetic", description="Type of variation: aesthetic, layout, content, or comprehensive")
    test_hypotheses: Optional[List[str]] = Field(default_factory=list, description="Specific hypotheses to test")
    preserve_branding: bool = Field(default=True, description="Whether to preserve brand elements")


class AITemplateVariantsResponse(BaseModel):
    """Response schema for AI template variant generation."""
    success: bool
    base_template_id: int
    variants: List[Dict[str, Any]] = Field(default_factory=list)
    variant_count: int
    generation_time: float
    error: Optional[str] = None


class AITemplatePersonalizeRequest(BaseModel):
    """Request schema for AI template personalization."""
    template_id: int = Field(..., description="Template ID to personalize")
    user_data: Dict[str, Any] = Field(default_factory=dict, description="User demographic and behavioral data")
    industry: str = Field(..., max_length=100, description="Target industry/business type")
    brand_preferences: Dict[str, Any] = Field(default_factory=dict, description="Brand colors, fonts, tone, etc.")
    customization_level: str = Field(default="moderate", description="Level of customization: minimal, moderate, extensive")
    target_goals: Optional[List[str]] = Field(default_factory=list, description="Specific business goals")


class AITemplatePersonalizeResponse(BaseModel):
    """Response schema for AI template personalization."""
    success: bool
    personalized_template: Optional[Dict[str, Any]] = None
    style_adjustments: Dict[str, Any] = Field(default_factory=dict)
    content_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    seo_optimizations: Dict[str, Any] = Field(default_factory=dict)
    personalization_score: float = Field(default=0.0)
    error: Optional[str] = None


class AITemplateBatchRequest(BaseModel):
    """Request schema for batch AI template operations."""
    templates: List[int] = Field(..., min_items=1, max_items=10, description="List of template IDs")
    operation: str = Field(..., description="Operation type: optimize, personalize, or analyze")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Operation-specific parameters")


class AITemplateBatchResponse(BaseModel):
    """Response schema for batch AI template operations."""
    success: bool
    results: List[Dict[str, Any]] = Field(default_factory=list)
    total_processed: int
    failed_count: int
    processing_time: float
    error: Optional[str] = None


class AITemplateAnalysisRequest(BaseModel):
    """Request schema for AI template analysis."""
    template_id: int = Field(..., description="Template ID to analyze")
    analysis_type: str = Field(..., description="Type of analysis: seo, conversion, performance, accessibility")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Context for analysis")


class AITemplateAnalysisResponse(BaseModel):
    """Response schema for AI template analysis."""
    success: bool
    template_id: int
    analysis_type: str
    score: float = Field(..., ge=0.0, le=100.0)
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    priority_level: str = Field(..., description="high, medium, or low")
    error: Optional[str] = None