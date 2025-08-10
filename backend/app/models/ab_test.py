"""
A/B testing models for template optimization.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, Integer, ForeignKey, Float, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
import math
from scipy import stats

from app.models.base import Base, TimestampMixin


class ABTestStatus(str, enum.Enum):
    """A/B test status."""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    STOPPED = "stopped"
    FAILED = "failed"


class ABTestType(str, enum.Enum):
    """A/B test types."""
    TEMPLATE_RECOMMENDATION = "template_recommendation"
    WORKFLOW_SUGGESTION = "workflow_suggestion"
    COMPONENT_OPTIMIZATION = "component_optimization"
    ALGORITHM_COMPARISON = "algorithm_comparison"


class ABTest(Base, TimestampMixin):
    """A/B test model for template optimization."""
    
    __tablename__ = "ab_tests"
    
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Test configuration
    test_type: Mapped[ABTestType] = mapped_column(Enum(ABTestType), default=ABTestType.TEMPLATE_RECOMMENDATION)
    base_template_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("templates.id"))
    primary_metric: Mapped[str] = mapped_column(String(100), default="conversion_rate")
    secondary_metrics: Mapped[List[str]] = mapped_column(JSON, default=list)
    status: Mapped[ABTestStatus] = mapped_column(Enum(ABTestStatus), default=ABTestStatus.DRAFT)
    
    # Statistical parameters
    required_sample_size: Mapped[int] = mapped_column(Integer, default=1000)
    confidence_level: Mapped[float] = mapped_column(Float, default=0.95)
    power: Mapped[float] = mapped_column(Float, default=0.8)
    minimum_detectable_effect: Mapped[float] = mapped_column(Float, default=0.05)  # 5% relative change
    
    # Traffic allocation
    traffic_allocation: Mapped[float] = mapped_column(Float, default=1.0)  # 0.0 to 1.0
    
    # Automatic stopping rules
    auto_stop_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    early_stopping_threshold: Mapped[float] = mapped_column(Float, default=0.99)  # confidence threshold
    max_duration_days: Mapped[int] = mapped_column(Integer, default=30)
    
    # Test timeline
    started_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    expected_completion_date: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    
    # Results and configuration
    configuration: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    final_results: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON)
    real_time_results: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    stop_reason: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Winner determination
    winning_variant_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("ab_test_variants.id"))
    statistical_significance_reached: Mapped[bool] = mapped_column(Boolean, default=False)
    significance_reached_at: Mapped[Optional[DateTime]] = mapped_column(DateTime)
    
    # Metadata
    created_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"))
    hypothesis: Mapped[Optional[str]] = mapped_column(Text)
    success_criteria: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Relationships
    base_template: Mapped[Optional["Template"]] = relationship("Template")
    variants: Mapped[List["ABTestVariant"]] = relationship("ABTestVariant", back_populates="ab_test", cascade="all, delete-orphan")
    creator: Mapped[Optional["User"]] = relationship("User")
    winning_variant: Mapped[Optional["ABTestVariant"]] = relationship("ABTestVariant", foreign_keys=[winning_variant_id], post_update=True)
    
    __table_args__ = (
        Index('idx_ab_tests_status', 'status', 'test_type'),
        Index('idx_ab_tests_created_by', 'created_by'),
        Index('idx_ab_tests_timeline', 'started_at', 'completed_at'),
    )
    
    @property
    def is_running(self) -> bool:
        """Check if test is currently running."""
        return self.status == ABTestStatus.RUNNING
    
    @property
    def total_sample_size(self) -> int:
        """Calculate total sample size across all variants."""
        return sum(variant.views for variant in self.variants)
    
    def calculate_statistical_significance(self) -> Dict[str, Any]:
        """Calculate statistical significance between variants."""
        if len(self.variants) < 2:
            return {"error": "Need at least 2 variants for comparison"}
        
        control = next((v for v in self.variants if v.is_control), None)
        if not control:
            return {"error": "No control variant found"}
        
        results = []
        for variant in self.variants:
            if variant.id == control.id:
                continue
                
            # Two-proportion z-test
            if variant.views > 0 and control.views > 0:
                p1 = variant.conversion_rate
                p2 = control.conversion_rate
                n1 = variant.views
                n2 = control.views
                
                # Pooled proportion
                p_pool = (variant.conversions + control.conversions) / (n1 + n2)
                se = math.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
                
                if se > 0:
                    z_score = (p1 - p2) / se
                    p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
                    
                    # Confidence interval for difference
                    se_diff = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
                    z_critical = stats.norm.ppf(1 - (1 - self.confidence_level) / 2)
                    diff = p1 - p2
                    ci_lower = diff - z_critical * se_diff
                    ci_upper = diff + z_critical * se_diff
                    
                    results.append({
                        "variant_id": variant.id,
                        "variant_name": variant.name,
                        "control_rate": p2,
                        "variant_rate": p1,
                        "relative_lift": ((p1 - p2) / p2 * 100) if p2 > 0 else 0,
                        "absolute_difference": diff,
                        "z_score": z_score,
                        "p_value": p_value,
                        "is_significant": p_value < (1 - self.confidence_level),
                        "confidence_interval": {"lower": ci_lower, "upper": ci_upper},
                        "sample_size": n1
                    })
        
        return {
            "control_variant": {
                "id": control.id,
                "name": control.name,
                "conversion_rate": control.conversion_rate,
                "sample_size": control.views
            },
            "comparisons": results,
            "overall_significance": any(r["is_significant"] for r in results)
        }
    
    def __repr__(self) -> str:
        return f"<ABTest(id={self.id}, name='{self.name}', status='{self.status}')>"


class ABTestVariant(Base, TimestampMixin):
    """A/B test variant model."""
    
    __tablename__ = "ab_test_variants"
    
    ab_test_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_tests.id"), nullable=False)
    
    # Variant identification
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_control: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Traffic distribution
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Template data
    template_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    configuration: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Performance metrics
    views: Mapped[int] = mapped_column(Integer, default=0)
    unique_views: Mapped[int] = mapped_column(Integer, default=0)
    conversions: Mapped[int] = mapped_column(Integer, default=0)
    bounces: Mapped[int] = mapped_column(Integer, default=0)
    interactions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Revenue tracking
    total_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    average_order_value: Mapped[Optional[float]] = mapped_column(Float)
    
    # Time-based metrics
    total_time_on_page: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    total_sessions: Mapped[int] = mapped_column(Integer, default=0)
    
    # Event tracking
    event_metadata: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    
    # Relationships
    ab_test: Mapped["ABTest"] = relationship("ABTest", back_populates="variants")
    
    @property
    def conversion_rate(self) -> float:
        """Calculate conversion rate for this variant."""
        return self.conversions / self.views if self.views > 0 else 0.0
    
    @property
    def bounce_rate(self) -> float:
        """Calculate bounce rate for this variant."""
        return self.bounces / self.views if self.views > 0 else 0.0
    
    @property
    def interaction_rate(self) -> float:
        """Calculate interaction rate for this variant."""
        return self.interactions / self.views if self.views > 0 else 0.0
    
    @property
    def average_session_duration(self) -> float:
        """Calculate average session duration in seconds."""
        return self.total_time_on_page / self.total_sessions if self.total_sessions > 0 else 0.0
    
    @property
    def revenue_per_visitor(self) -> float:
        """Calculate revenue per visitor."""
        return self.total_revenue / self.views if self.views > 0 else 0.0
    
    def get_confidence_interval(self, confidence_level: float = 0.95) -> Dict[str, float]:
        """Calculate confidence interval for conversion rate."""
        if self.views == 0:
            return {"lower": 0.0, "upper": 0.0}
        
        p = self.conversion_rate
        n = self.views
        z = stats.norm.ppf(1 - (1 - confidence_level) / 2)
        se = math.sqrt(p * (1 - p) / n)
        
        return {
            "lower": max(0, p - z * se),
            "upper": min(1, p + z * se)
        }
    
    def __repr__(self) -> str:
        return f"<ABTestVariant(id={self.id}, name='{self.name}', test_id={self.ab_test_id})>"


class ABTestEvent(Base, TimestampMixin):
    """A/B test event tracking model."""
    
    __tablename__ = "ab_test_events"
    
    ab_test_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_tests.id"), nullable=False)
    variant_id: Mapped[int] = mapped_column(Integer, ForeignKey("ab_test_variants.id"), nullable=False)
    
    # Event details
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)  # view, conversion, bounce, etc.
    session_id: Mapped[Optional[str]] = mapped_column(String(255))
    user_id: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Event metadata
    metadata: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Relationships
    ab_test: Mapped["ABTest"] = relationship("ABTest")
    variant: Mapped["ABTestVariant"] = relationship("ABTestVariant")
    
    def __repr__(self) -> str:
        return f"<ABTestEvent(id={self.id}, type='{self.event_type}', test_id={self.ab_test_id})>"