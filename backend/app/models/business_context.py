"""
Business Context Models for Epic 1 Integration
Supporting models for business context analysis and Epic 1-3-4 system integration.
"""

import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base import BaseModel


class BusinessContextAnalysis(BaseModel):
    """Store business context analysis results and link to Epic 3-4 systems."""
    
    __tablename__ = "business_context_analysis"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Business context core data
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    target_audience = Column(String(50), nullable=False)
    primary_goals = Column(JSONB, nullable=True)
    business_context_data = Column(JSONB, nullable=False)
    
    # Analysis results
    analysis_result = Column(JSONB, nullable=False)
    confidence_score = Column(Float, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    analysis_type = Column(String(50), nullable=False)  # 'context_analysis', 'industry_analysis', etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="business_context_analyses")
    template_scorings = relationship("TemplateContextScoring", back_populates="business_context_analysis", cascade="all, delete-orphan")
    usage_analytics = relationship("BusinessContextUsageAnalytics", back_populates="business_context_analysis")
    
    # Indexes defined in migration
    __table_args__ = (
        Index('ix_business_context_analysis_user_id', 'user_id'),
        Index('ix_business_context_analysis_industry', 'industry'),
        Index('ix_business_context_analysis_created_at', 'created_at'),
    )


class BusinessContextUsageAnalytics(BaseModel):
    """Track business context API usage for Epic 3 analytics integration."""
    
    __tablename__ = "business_context_usage_analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Usage metrics
    analysis_type = Column(String(50), nullable=False)
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    processing_time_ms = Column(Integer, nullable=False)
    confidence_score = Column(Float, nullable=True)
    recommendations_generated = Column(Integer, nullable=True)
    
    # User feedback and outcomes
    user_feedback_score = Column(Integer, nullable=True)  # 1-5 rating
    conversion_outcome = Column(Boolean, nullable=True)  # Did user convert/complete goal
    session_id = Column(String, nullable=True)
    
    # Metadata for Epic 3-4 integration
    request_metadata = Column(JSONB, nullable=True)
    response_metadata = Column(JSONB, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="business_context_usage")
    business_context_analysis_id = Column(String, ForeignKey("business_context_analysis.id", ondelete="CASCADE"), nullable=True)
    business_context_analysis = relationship("BusinessContextAnalysis", back_populates="usage_analytics")
    
    # Indexes defined in migration
    __table_args__ = (
        Index('ix_bc_usage_analytics_user_id', 'user_id'),
        Index('ix_bc_usage_analytics_industry', 'industry'),
        Index('ix_bc_usage_analytics_timestamp', 'timestamp'),
        Index('ix_bc_usage_analytics_analysis_type', 'analysis_type'),
    )


class TemplateContextScoring(BaseModel):
    """Store template suitability scores for business contexts (Epic 1-4 integration)."""
    
    __tablename__ = "template_context_scoring"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    business_context_analysis_id = Column(String, ForeignKey("business_context_analysis.id", ondelete="CASCADE"), nullable=False)
    
    # Scoring dimensions
    industry_alignment_score = Column(Float, nullable=False)
    goal_compatibility_score = Column(Float, nullable=False)
    feature_coverage_score = Column(Float, nullable=False)
    complexity_match_score = Column(Float, nullable=False)
    overall_suitability_score = Column(Float, nullable=False)
    
    # Recommendation data
    recommendation_level = Column(String(50), nullable=False)  # 'highly_recommended', 'recommended', etc.
    score_explanation = Column(Text, nullable=True)
    potential_issues = Column(JSONB, nullable=True)
    customization_suggestions = Column(JSONB, nullable=True)
    
    # AI analysis integration (Epic 4)
    ai_analysis_data = Column(JSONB, nullable=True)
    
    # Outcome tracking (Epic 3)
    user_selected = Column(Boolean, nullable=True)
    actual_performance = Column(JSONB, nullable=True)  # Filled from Epic 3 analytics
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    template = relationship("Template", back_populates="context_scorings")
    user = relationship("User", back_populates="template_context_scorings")
    business_context_analysis = relationship("BusinessContextAnalysis", back_populates="template_scorings")
    
    # Indexes defined in migration
    __table_args__ = (
        Index('ix_template_context_scoring_template_id', 'template_id'),
        Index('ix_template_context_scoring_user_id', 'user_id'),
        Index('ix_template_context_scoring_overall_score', 'overall_suitability_score'),
    )


class BusinessSuccessPattern(BaseModel):
    """Store proven success patterns for business contexts (Epic 1-3-4 learning system)."""
    
    __tablename__ = "business_success_patterns"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Pattern identification
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    business_model = Column(String(50), nullable=False)
    primary_goal = Column(String(50), nullable=False)
    
    # Pattern data
    template_features = Column(JSONB, nullable=False)
    success_metrics = Column(JSONB, nullable=False)
    
    # Performance metrics from Epic 3
    conversion_rate = Column(Float, nullable=True)
    engagement_rate = Column(Float, nullable=True)
    bounce_rate = Column(Float, nullable=True)
    time_on_page = Column(Float, nullable=True)
    
    # Pattern metadata
    confidence_score = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False)
    pattern_source = Column(String(50), nullable=False)  # 'historical_data', 'ai_generated', 'industry_benchmark'
    validation_status = Column(String(20), nullable=False)  # 'pending', 'validated', 'deprecated'
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_validated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes defined in migration
    __table_args__ = (
        Index('ix_success_patterns_industry', 'industry'),
        Index('ix_success_patterns_company_size', 'company_size'),
        Index('ix_success_patterns_goal', 'primary_goal'),
        Index('ix_success_patterns_confidence', 'confidence_score'),
        Index('ix_success_patterns_validation', 'validation_status'),
    )


class EpicIntegrationMetrics(BaseModel):
    """Track Epic 1-3-4 integration performance and metrics."""
    
    __tablename__ = "epic_integration_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Integration identification
    integration_type = Column(String(50), nullable=False)  # 'epic1_to_epic3', 'epic1_to_epic4', 'epic3_to_epic4'
    source_system = Column(String(20), nullable=False)    # 'business_context', 'analytics', 'ai_features'
    target_system = Column(String(20), nullable=False)
    operation_type = Column(String(50), nullable=False)   # 'recommendation', 'analysis', 'optimization'
    
    # Operation data
    input_data = Column(JSONB, nullable=True)
    output_data = Column(JSONB, nullable=True)
    processing_time_ms = Column(Integer, nullable=False)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Quality metrics
    accuracy_score = Column(Float, nullable=True)
    user_satisfaction = Column(Integer, nullable=True)  # 1-5 rating
    business_impact = Column(JSONB, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="epic_integration_metrics")
    
    # Indexes defined in migration
    __table_args__ = (
        Index('ix_epic_integration_metrics_user_id', 'user_id'),
        Index('ix_epic_integration_metrics_integration_type', 'integration_type'),
        Index('ix_epic_integration_metrics_timestamp', 'timestamp'),
        Index('ix_epic_integration_metrics_success', 'success'),
    )


# Extend User model for business context (added in migration)
# These fields are added via migration to the existing users table:
# - industry_preference: String(100)
# - company_size_category: String(50)
# - business_goals: JSONB
# - target_audience_focus: String(50)
# - technical_expertise_level: String(20)
# - context_preferences: JSONB
# - onboarding_completed: Boolean
# - context_analysis_count: Integer


# Add relationships to existing models (these would be added to their respective model files)

# For User model (app/models/user.py):
# business_context_analyses = relationship("BusinessContextAnalysis", back_populates="user", cascade="all, delete-orphan")
# business_context_usage = relationship("BusinessContextUsageAnalytics", back_populates="user", cascade="all, delete-orphan")
# template_context_scorings = relationship("TemplateContextScoring", back_populates="user", cascade="all, delete-orphan")
# epic_integration_metrics = relationship("EpicIntegrationMetrics", back_populates="user", cascade="all, delete-orphan")

# For Template model (app/models/template.py):
# context_scorings = relationship("TemplateContextScoring", back_populates="template", cascade="all, delete-orphan")