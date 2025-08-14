"""
Test Epic Integration Service - Epic 1-3-4 Integration Testing
Tests for cross-Epic data flow and optimization capabilities.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.epic_integration_service import EpicIntegrationService, IntegrationResult, CrossEpicInsight
from app.models.business_context import BusinessContextAnalysis, EpicIntegrationMetrics
from app.models.analytics import SiteAnalytics


class TestEpicIntegrationService:
    """Test suite for Epic integration service."""
    
    @pytest.fixture
    def mock_db_session(self):
        return AsyncMock()
    
    @pytest.fixture
    def integration_service(self, mock_db_session):
        return EpicIntegrationService(mock_db_session)
    
    @pytest.fixture
    def sample_business_context(self):
        return {
            "industry": "technology",
            "company_size": "small_business",
            "marketing_goals": ["lead_generation", "brand_awareness"],
            "target_audience": "business",
            "technical_expertise": "intermediate",
            "budget_range": "medium"
        }
    
    @pytest.fixture
    def mock_performance_data(self):
        return {
            "conversion_rate": 0.035,
            "bounce_rate": 0.42,
            "avg_session_duration": 195,
            "pages_per_session": 2.3,
            "unique_visitors": 1250,
            "total_sessions": 2100,
            "component_performance": {
                "contact_form": {"conversion_rate": 0.08, "interaction_rate": 0.25},
                "testimonials": {"conversion_rate": 0.05, "interaction_rate": 0.15}
            },
            "data_available": True
        }


class TestContextEnhancedRecommendations:
    """Test Epic 1→Epic 4→Epic 3 integration flow."""
    
    @pytest.mark.asyncio
    async def test_generate_context_enhanced_recommendations_success(
        self, 
        integration_service, 
        sample_business_context,
        mock_performance_data
    ):
        """Test successful context-enhanced recommendations generation."""
        
        # Mock context analysis
        mock_context_analysis = MagicMock()
        mock_context_analysis.confidence_level = "high"
        mock_context_analysis.recommended_categories = ["professional_services", "technology"]
        mock_context_analysis.success_probability = 0.78
        mock_context_analysis.context_score = 0.85
        
        # Mock AI recommendations
        mock_ai_recommendations = [
            {
                "component_type": "contact_form",
                "reasoning": "Essential for lead generation",
                "priority": "high",
                "confidence_score": 0.9
            },
            {
                "component_type": "testimonials",
                "reasoning": "Build trust and credibility",
                "priority": "medium",
                "confidence_score": 0.75
            }
        ]
        
        # Mock service methods
        integration_service.context_service.analyze_user_context = AsyncMock(return_value=mock_context_analysis)
        integration_service._get_performance_constraints = AsyncMock(return_value=mock_performance_data)
        integration_service.ai_service.generate_component_suggestions = AsyncMock(return_value=mock_ai_recommendations)
        integration_service._optimize_recommendations_with_analytics = AsyncMock(return_value=mock_ai_recommendations)
        integration_service._track_integration_metrics = AsyncMock()
        
        # Execute test
        result = await integration_service.generate_context_enhanced_recommendations(
            user_id="test_user_123",
            business_context=sample_business_context
        )
        
        # Verify result
        assert result.success is True
        assert result.integration_type == "epic1_to_epic4_to_epic3"
        assert result.source_system == "business_context"
        assert result.target_system == "ai_features"
        assert result.accuracy_score == 0.85
        assert result.processing_time_ms > 0
        
        # Verify data structure
        assert "context_analysis" in result.data
        assert "performance_insights" in result.data
        assert "ai_recommendations" in result.data
        assert "optimization_applied" in result.data
        assert result.data["optimization_applied"] is True
        
        # Verify service calls
        integration_service.context_service.analyze_user_context.assert_called_once()
        integration_service._get_performance_constraints.assert_called_once()
        integration_service.ai_service.generate_component_suggestions.assert_called_once()
        integration_service._track_integration_metrics.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_context_enhanced_recommendations_error_handling(
        self,
        integration_service,
        sample_business_context
    ):
        """Test error handling in context-enhanced recommendations."""
        
        # Mock failure in context analysis
        integration_service.context_service.analyze_user_context = AsyncMock(
            side_effect=Exception("Context analysis failed")
        )
        integration_service._track_integration_metrics = AsyncMock()
        
        # Execute test
        result = await integration_service.generate_context_enhanced_recommendations(
            user_id="test_user_123",
            business_context=sample_business_context
        )
        
        # Verify error handling
        assert result.success is False
        assert result.error_message == "Context analysis failed"
        assert result.integration_type == "epic1_to_epic4_to_epic3"
        assert result.processing_time_ms > 0
        
        # Verify error tracking
        integration_service._track_integration_metrics.assert_called_once()
        call_args = integration_service._track_integration_metrics.call_args
        assert call_args[1]["success"] is False
        assert call_args[1]["error_message"] == "Context analysis failed"


class TestPerformanceContextAnalysis:
    """Test Epic 3→Epic 1→Epic 4 integration flow."""
    
    @pytest.mark.asyncio
    async def test_analyze_performance_with_business_context_success(
        self,
        integration_service,
        sample_business_context,
        mock_performance_data
    ):
        """Test successful performance analysis with business context."""
        
        # Mock context analysis
        mock_context_analysis = MagicMock()
        mock_context_analysis.success_probability = 0.72
        mock_context_analysis.confidence_level = "medium"
        mock_context_analysis.recommended_categories = ["technology"]
        mock_context_analysis.context_score = 0.75
        
        # Mock AI insights
        mock_ai_insights = {
            "performance_assessment": {
                "overall_health": "good",
                "vs_industry_benchmark": "above average",
                "vs_business_goals": "meeting goals"
            },
            "context_performance_alignment": {
                "industry_typical": True,
                "size_appropriate": True,
                "goal_alignment_score": 0.8
            },
            "improvement_opportunities": [
                {
                    "area": "conversion_optimization",
                    "impact": "high",
                    "effort": "medium",
                    "recommendation": "Add social proof elements"
                }
            ]
        }
        
        # Mock service methods
        integration_service._get_comprehensive_performance_data = AsyncMock(return_value=mock_performance_data)
        integration_service._infer_business_context_from_performance = AsyncMock(return_value=sample_business_context)
        integration_service.context_service.analyze_user_context = AsyncMock(return_value=mock_context_analysis)
        integration_service.ai_service.generate_json_response = AsyncMock(return_value=mock_ai_insights)
        integration_service._calculate_integration_score = AsyncMock(return_value=0.82)
        integration_service._track_integration_metrics = AsyncMock()
        
        # Execute test
        result = await integration_service.analyze_performance_with_business_context(
            user_id="test_user_123",
            site_id="test_site_456",
            business_context=sample_business_context
        )
        
        # Verify result
        assert result.success is True
        assert result.integration_type == "epic3_to_epic1_to_epic4"
        assert result.source_system == "analytics"
        assert result.target_system == "ai_features"
        assert result.accuracy_score == 0.75
        
        # Verify data structure
        assert "performance_data" in result.data
        assert "business_context" in result.data
        assert "context_analysis" in result.data
        assert "ai_insights" in result.data
        assert "integration_score" in result.data
        
        # Verify AI insights quality
        ai_insights = result.data["ai_insights"]
        assert "performance_assessment" in ai_insights
        assert "improvement_opportunities" in ai_insights
        assert ai_insights["context_performance_alignment"]["goal_alignment_score"] == 0.8
    
    @pytest.mark.asyncio
    async def test_infer_business_context_from_performance(
        self,
        integration_service,
        mock_performance_data
    ):
        """Test business context inference from performance data."""
        
        # Execute test
        inferred_context = await integration_service._infer_business_context_from_performance(
            mock_performance_data
        )
        
        # Verify inference logic
        assert "industry" in inferred_context
        assert "company_size" in inferred_context
        assert "marketing_goals" in inferred_context
        assert inferred_context["inferred_from_performance"] is True
        assert inferred_context["confidence_level"] == "medium"
        
        # Verify inference based on performance patterns
        # High unique visitors should infer medium+ business size
        if mock_performance_data["unique_visitors"] > 1000:
            assert inferred_context["company_size"] in ["medium_business", "enterprise"]


class TestCrossEpicInsights:
    """Test cross-Epic insights discovery."""
    
    @pytest.mark.asyncio
    async def test_discover_cross_epic_insights_success(
        self,
        integration_service
    ):
        """Test successful cross-Epic insights discovery."""
        
        # Mock individual insight analysis methods
        mock_context_insight = CrossEpicInsight(
            insight_type="context_performance_correlation",
            source_data={"context_analyses": 5},
            analysis_result={"best_performing_industry": "technology"},
            confidence_score=0.85,
            recommendations=["Focus on technology industry strategies"],
            impact_assessment={"potential_improvement": "15-25%"}
        )
        
        integration_service._analyze_context_performance_correlation = AsyncMock(return_value=mock_context_insight)
        integration_service._analyze_ai_recommendation_outcomes = AsyncMock(return_value=None)
        integration_service._analyze_industry_pattern_performance = AsyncMock(return_value=None)
        integration_service._analyze_template_scoring_accuracy = AsyncMock(return_value=None)
        
        # Execute test
        insights = await integration_service.discover_cross_epic_insights(
            user_id="test_user_123",
            analysis_window_days=30
        )
        
        # Verify insights
        assert len(insights) == 1
        assert insights[0].insight_type == "context_performance_correlation"
        assert insights[0].confidence_score == 0.85
        assert "Focus on technology industry strategies" in insights[0].recommendations
    
    @pytest.mark.asyncio
    async def test_analyze_context_performance_correlation(
        self,
        integration_service,
        mock_db_session
    ):
        """Test context-performance correlation analysis."""
        
        # Mock database queries
        mock_context_analyses = [
            MagicMock(
                industry="technology",
                confidence_score=0.85,
                created_at=datetime.utcnow() - timedelta(days=5)
            ),
            MagicMock(
                industry="technology", 
                confidence_score=0.78,
                created_at=datetime.utcnow() - timedelta(days=10)
            )
        ]
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_context_analyses
        mock_db_session.execute = AsyncMock(return_value=mock_result)
        
        # Execute test
        insight = await integration_service._analyze_context_performance_correlation(
            user_id="test_user_123",
            days=30
        )
        
        # Verify insight
        assert insight is not None
        assert insight.insight_type == "context_performance_correlation"
        assert insight.analysis_result["best_performing_industry"] == "technology"
        assert insight.confidence_score == 0.8
        assert len(insight.recommendations) > 0


class TestBusinessContextOptimization:
    """Test Epic 1↔Epic 3 optimization."""
    
    @pytest.mark.asyncio
    async def test_optimize_business_context_with_performance_data(
        self,
        integration_service,
        sample_business_context
    ):
        """Test business context optimization with performance data."""
        
        # Mock performance data
        mock_historical_performance = {
            "data_available": True,
            "avg_conversion_rate": 0.032,
            "avg_bounce_rate": 0.38,
            "performance_trend": "improving"
        }
        
        mock_industry_benchmarks = {
            "avg_conversion_rate": 0.025,
            "avg_bounce_rate": 0.45,
            "data_source": "historical_data"
        }
        
        mock_optimization_result = {
            "context_adjustments": {
                "industry_refinement": "enterprise_software",
                "goal_prioritization": ["lead_generation", "customer_retention"],
                "audience_targeting": "enterprise_decision_makers"
            },
            "performance_insights": {
                "strengths": ["above_average_conversion"],
                "weaknesses": ["session_duration"],
                "opportunities": ["mobile_optimization"]
            },
            "confidence_score": 0.88
        }
        
        # Mock service methods
        integration_service._get_user_historical_performance = AsyncMock(return_value=mock_historical_performance)
        integration_service._get_industry_performance_benchmarks = AsyncMock(return_value=mock_industry_benchmarks)
        integration_service.ai_service.generate_json_response = AsyncMock(return_value=mock_optimization_result)
        
        # Execute test
        result = await integration_service.optimize_business_context_with_performance_data(
            user_id="test_user_123",
            business_context=sample_business_context
        )
        
        # Verify result
        assert result.success is True
        assert result.integration_type == "epic1_to_epic3_optimization"
        assert result.accuracy_score == 0.88
        
        # Verify data structure
        assert "original_context" in result.data
        assert "optimization_result" in result.data
        assert "historical_performance" in result.data
        assert "industry_benchmarks" in result.data
        
        # Verify optimization quality
        optimization = result.data["optimization_result"]
        assert "context_adjustments" in optimization
        assert "performance_insights" in optimization
        assert optimization["confidence_score"] == 0.88


class TestPerformanceConstraints:
    """Test performance constraint generation and application."""
    
    @pytest.mark.asyncio
    async def test_get_performance_constraints(
        self,
        integration_service
    ):
        """Test performance constraints generation."""
        
        # Mock performance data
        mock_user_performance = {
            "avg_conversion_rate": 0.028,
            "avg_bounce_rate": 0.42,
            "avg_session_duration": 185
        }
        
        mock_industry_benchmarks = {
            "avg_conversion_rate": 0.025,
            "avg_bounce_rate": 0.45,
            "avg_session_duration": 180
        }
        
        integration_service._get_user_historical_performance = AsyncMock(return_value=mock_user_performance)
        integration_service._get_industry_performance_benchmarks = AsyncMock(return_value=mock_industry_benchmarks)
        
        # Execute test
        constraints = await integration_service._get_performance_constraints(
            user_id="test_user_123",
            industry="technology"
        )
        
        # Verify constraints structure
        assert "user_historical" in constraints
        assert "industry_benchmarks" in constraints
        assert "benchmarks" in constraints
        
        # Verify benchmark calculations
        benchmarks = constraints["benchmarks"]
        assert "min_conversion_rate" in benchmarks
        assert "max_bounce_rate" in benchmarks
        assert "min_session_duration" in benchmarks
        
        # Verify improvement targets (should aim for 10% improvement)
        expected_min_conversion = mock_user_performance["avg_conversion_rate"] * 1.1
        assert abs(benchmarks["min_conversion_rate"] - expected_min_conversion) < 0.001
    
    @pytest.mark.asyncio
    async def test_optimize_recommendations_with_analytics(
        self,
        integration_service,
        mock_performance_data
    ):
        """Test recommendation optimization with analytics data."""
        
        # Mock recommendations
        mock_recommendations = [
            {
                "component_type": "contact_form",
                "confidence_score": 0.7,
                "priority": "high"
            },
            {
                "component_type": "testimonials",
                "confidence_score": 0.6,
                "priority": "medium"
            }
        ]
        
        # Mock context analysis
        mock_context_analysis = MagicMock()
        mock_context_analysis.confidence_level = "high"
        
        # Execute test
        optimized = await integration_service._optimize_recommendations_with_analytics(
            recommendations=mock_recommendations,
            performance_data=mock_performance_data,
            context_analysis=mock_context_analysis
        )
        
        # Verify optimization
        assert len(optimized) == len(mock_recommendations)
        
        for rec in optimized:
            assert "optimization_applied" in rec
            assert rec["optimization_applied"] is True
            assert "performance_insights" in rec
            
            # Verify score adjustment
            insights = rec["performance_insights"]
            assert "base_score" in insights
            assert "performance_adjustment" in insights
            assert "final_score" in insights
            
            # Verify final score is within bounds
            assert 0.0 <= rec["confidence_score"] <= 1.0


class TestIntegrationMetricsTracking:
    """Test Epic integration metrics tracking."""
    
    @pytest.mark.asyncio
    async def test_track_integration_metrics_success(
        self,
        integration_service,
        mock_db_session
    ):
        """Test successful integration metrics tracking."""
        
        # Execute test
        await integration_service._track_integration_metrics(
            user_id="test_user_123",
            integration_type="epic1_to_epic4",
            source_system="business_context",
            target_system="ai_features",
            operation_type="recommendation",
            input_data={"industry": "technology"},
            output_data={"recommendations": 5},
            processing_time_ms=250,
            success=True,
            accuracy_score=0.85
        )
        
        # Verify database operations
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        
        # Verify metric object creation
        added_metric = mock_db_session.add.call_args[0][0]
        assert added_metric.user_id == "test_user_123"
        assert added_metric.integration_type == "epic1_to_epic4"
        assert added_metric.success is True
        assert added_metric.accuracy_score == 0.85
    
    @pytest.mark.asyncio
    async def test_track_integration_metrics_error_handling(
        self,
        integration_service,
        mock_db_session
    ):
        """Test integration metrics tracking error handling."""
        
        # Mock database error
        mock_db_session.add.side_effect = Exception("Database error")
        mock_db_session.rollback = AsyncMock()
        
        # Execute test (should not raise exception)
        await integration_service._track_integration_metrics(
            user_id="test_user_123",
            integration_type="epic1_to_epic4",
            source_system="business_context",
            target_system="ai_features",
            operation_type="recommendation",
            input_data={},
            output_data={},
            processing_time_ms=100,
            success=False,
            error_message="Test error"
        )
        
        # Verify rollback was called
        mock_db_session.rollback.assert_called_once()


class TestIntegrationResultModel:
    """Test IntegrationResult data model."""
    
    def test_integration_result_creation(self):
        """Test IntegrationResult creation and attributes."""
        
        result = IntegrationResult(
            success=True,
            processing_time_ms=150,
            data={"key": "value"},
            accuracy_score=0.88,
            integration_type="epic1_to_epic4",
            source_system="business_context",
            target_system="ai_features"
        )
        
        assert result.success is True
        assert result.processing_time_ms == 150
        assert result.data == {"key": "value"}
        assert result.accuracy_score == 0.88
        assert result.integration_type == "epic1_to_epic4"
        assert result.source_system == "business_context"
        assert result.target_system == "ai_features"
        assert result.error_message is None
    
    def test_integration_result_error_case(self):
        """Test IntegrationResult for error cases."""
        
        result = IntegrationResult(
            success=False,
            processing_time_ms=75,
            data={},
            error_message="Operation failed",
            integration_type="epic1_to_epic4",
            source_system="business_context",
            target_system="ai_features"
        )
        
        assert result.success is False
        assert result.error_message == "Operation failed"
        assert result.accuracy_score is None
        assert result.data == {}


class TestCrossEpicInsightModel:
    """Test CrossEpicInsight data model."""
    
    def test_cross_epic_insight_creation(self):
        """Test CrossEpicInsight creation and attributes."""
        
        insight = CrossEpicInsight(
            insight_type="context_performance_correlation",
            source_data={"analyses": 10},
            analysis_result={"correlation": 0.75},
            confidence_score=0.85,
            recommendations=["Optimize for mobile", "Improve loading speed"],
            impact_assessment={"potential_improvement": "20-30%", "confidence": "high"}
        )
        
        assert insight.insight_type == "context_performance_correlation"
        assert insight.source_data == {"analyses": 10}
        assert insight.analysis_result == {"correlation": 0.75}
        assert insight.confidence_score == 0.85
        assert len(insight.recommendations) == 2
        assert insight.impact_assessment["potential_improvement"] == "20-30%"