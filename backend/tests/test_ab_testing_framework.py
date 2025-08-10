"""
Comprehensive test suite for A/B testing framework.
Tests statistical analysis, optimization algorithms, and framework functionality.
"""

import pytest
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ab_testing_framework import ABTestingFramework, StatisticalAnalyzer
from app.services.recommendation_optimizer import RecommendationOptimizer
from app.services.realtime_monitoring import RealTimeMonitor
from app.models.ab_test import ABTest, ABTestVariant, ABTestStatus, ABTestType
from app.models.analytics import RecommendationEvent, EventType
from app.models.template import Template, TemplateCategory


class TestStatisticalAnalyzer:
    """Test statistical analysis functions."""
    
    def test_calculate_sample_size_valid_inputs(self):
        """Test sample size calculation with valid inputs."""
        analyzer = StatisticalAnalyzer()
        
        # Test typical conversion rate scenario
        sample_size = analyzer.calculate_sample_size(
            baseline_rate=0.15,
            minimum_detectable_effect=0.05,
            power=0.8,
            alpha=0.05
        )
        
        assert isinstance(sample_size, int)
        assert sample_size > 100
        assert sample_size < 50000  # Reasonable upper bound
    
    def test_calculate_sample_size_edge_cases(self):
        """Test sample size calculation with edge cases."""
        analyzer = StatisticalAnalyzer()
        
        # Very low baseline rate
        sample_size = analyzer.calculate_sample_size(
            baseline_rate=0.01,
            minimum_detectable_effect=0.1,
            power=0.8
        )
        assert sample_size >= 100
        
        # High baseline rate
        sample_size = analyzer.calculate_sample_size(
            baseline_rate=0.8,
            minimum_detectable_effect=0.05,
            power=0.8
        )
        assert sample_size >= 100
    
    def test_calculate_sample_size_invalid_inputs(self):
        """Test sample size calculation with invalid inputs."""
        analyzer = StatisticalAnalyzer()
        
        with pytest.raises(ValueError):
            analyzer.calculate_sample_size(0, 0.1)  # Invalid baseline rate
        
        with pytest.raises(ValueError):
            analyzer.calculate_sample_size(1.5, 0.1)  # Invalid baseline rate
    
    def test_two_proportion_test_no_difference(self):
        """Test two proportion test when there's no difference."""
        analyzer = StatisticalAnalyzer()
        
        result = analyzer.two_proportion_test(
            n1=1000, x1=150,  # 15% conversion rate
            n2=1000, x2=150,  # 15% conversion rate
            confidence_level=0.95
        )
        
        assert result["control_rate"] == 0.15
        assert result["variant_rate"] == 0.15
        assert result["absolute_difference"] == 0
        assert result["p_value"] > 0.05  # Not significant
        assert not result["is_significant"]
    
    def test_two_proportion_test_significant_difference(self):
        """Test two proportion test with significant difference."""
        analyzer = StatisticalAnalyzer()
        
        result = analyzer.two_proportion_test(
            n1=1000, x1=200,  # 20% conversion rate
            n2=1000, x2=150,  # 15% conversion rate
            confidence_level=0.95
        )
        
        assert result["control_rate"] == 0.15
        assert result["variant_rate"] == 0.20
        assert result["absolute_difference"] > 0
        assert result["relative_improvement"] > 0
        assert result["p_value"] < 0.05  # Significant
        assert result["is_significant"]
    
    def test_two_proportion_test_edge_cases(self):
        """Test two proportion test edge cases."""
        analyzer = StatisticalAnalyzer()
        
        # Zero sample size
        result = analyzer.two_proportion_test(n1=0, x1=0, n2=100, x2=10)
        assert "error" in result
        
        # All conversions
        result = analyzer.two_proportion_test(n1=100, x1=100, n2=100, x2=90)
        assert result["variant_rate"] == 1.0
        assert result["control_rate"] == 0.9
    
    def test_bayesian_probability_variant_better(self):
        """Test Bayesian probability calculation."""
        analyzer = StatisticalAnalyzer()
        
        # Variant clearly better
        result = analyzer.bayesian_probability(
            n1=1000, x1=200,  # 20% conversion rate
            n2=1000, x2=100   # 10% conversion rate
        )
        
        assert result["probability_variant_better"] > 0.95
        assert result["expected_variant_rate"] > result["expected_control_rate"]
        assert "credible_interval_variant" in result
        assert "credible_interval_control" in result
    
    def test_bayesian_probability_no_difference(self):
        """Test Bayesian probability when no difference."""
        analyzer = StatisticalAnalyzer()
        
        result = analyzer.bayesian_probability(
            n1=1000, x1=150,  # 15% conversion rate
            n2=1000, x2=150   # 15% conversion rate
        )
        
        # Should be close to 50% probability either way
        assert 0.4 < result["probability_variant_better"] < 0.6


class TestABTestingFramework:
    """Test A/B testing framework functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        db = AsyncMock(spec=AsyncSession)
        return db
    
    @pytest.fixture
    def ab_framework(self, mock_db):
        """Create A/B testing framework instance."""
        return ABTestingFramework(mock_db)
    
    @pytest.mark.asyncio
    async def test_create_recommendation_ab_test(self, ab_framework, mock_db):
        """Test creating a recommendation A/B test."""
        
        # Mock database operations
        mock_db.add = MagicMock()
        mock_db.flush = AsyncMock()
        mock_db.commit = AsyncMock()
        
        algorithm_variants = [
            {
                "name": "Control Algorithm",
                "description": "Current recommendation algorithm",
                "is_control": True,
                "algorithm_config": {"version": "v1.0"}
            },
            {
                "name": "Optimized Algorithm",
                "description": "AI-optimized recommendation algorithm",
                "is_control": False,
                "algorithm_config": {"version": "v1.1", "optimizations": ["feature_1", "feature_2"]}
            }
        ]
        
        test_config = {
            "baseline_conversion_rate": 0.15,
            "minimum_detectable_effect": 0.05,
            "confidence_level": 0.95,
            "power": 0.8
        }
        
        # Create test
        ab_test = await ab_framework.create_recommendation_ab_test(
            name="Algorithm Optimization Test",
            description="Testing optimized recommendation algorithm",
            algorithm_variants=algorithm_variants,
            test_config=test_config,
            creator_id=1
        )
        
        # Verify test creation
        assert ab_test.name == "Algorithm Optimization Test"
        assert ab_test.test_type == ABTestType.ALGORITHM_COMPARISON
        assert ab_test.status == ABTestStatus.DRAFT
        assert ab_test.required_sample_size > 0
        assert mock_db.add.called
        assert mock_db.commit.called
    
    @pytest.mark.asyncio
    async def test_start_ab_test(self, ab_framework, mock_db):
        """Test starting an A/B test."""
        
        # Create mock test
        mock_test = MagicMock(spec=ABTest)
        mock_test.id = 1
        mock_test.status = ABTestStatus.DRAFT
        mock_test.max_duration_days = 14
        mock_test.variants = [
            MagicMock(id=1, name="Control", is_control=True, weight=1.0),
            MagicMock(id=2, name="Variant", is_control=False, weight=1.0)
        ]
        
        mock_db.get.return_value = mock_test
        mock_db.commit = AsyncMock()
        
        # Start test
        result = await ab_framework.start_ab_test(1)
        
        # Verify test started
        assert result["success"]
        assert result["test_id"] == 1
        assert result["status"] == "running"
        assert mock_test.status == ABTestStatus.RUNNING
        assert mock_test.started_at is not None
    
    @pytest.mark.asyncio
    async def test_record_recommendation_event(self, ab_framework, mock_db):
        """Test recording recommendation events."""
        
        mock_variant = MagicMock(spec=ABTestVariant)
        mock_variant.views = 100
        mock_variant.conversions = 10
        
        mock_db.get.return_value = mock_variant
        mock_db.add = MagicMock()
        mock_db.commit = AsyncMock()
        
        # Record view event
        await ab_framework.record_recommendation_event(
            session_id="session_123",
            algorithm_version="v1.0",
            recommendation_type="template",
            recommendation_id="template_456",
            event_type=EventType.VIEW,
            variant_id=1
        )
        
        # Verify event recorded
        assert mock_db.add.called
        assert mock_db.commit.called
        assert mock_variant.views == 101  # Incremented
    
    @pytest.mark.asyncio
    async def test_get_ab_test_results_with_significance(self, ab_framework, mock_db):
        """Test getting A/B test results with statistical significance."""
        
        # Create mock test with variants
        mock_control = MagicMock(spec=ABTestVariant)
        mock_control.id = 1
        mock_control.name = "Control"
        mock_control.is_control = True
        mock_control.views = 1000
        mock_control.conversions = 100
        mock_control.conversion_rate = 0.10
        mock_control.bounce_rate = 0.40
        mock_control.revenue_per_visitor = 5.0
        
        mock_variant = MagicMock(spec=ABTestVariant)
        mock_variant.id = 2
        mock_variant.name = "Variant"
        mock_variant.is_control = False
        mock_variant.views = 1000
        mock_variant.conversions = 150
        mock_variant.conversion_rate = 0.15
        mock_variant.bounce_rate = 0.35
        mock_variant.revenue_per_visitor = 7.5
        
        mock_test = MagicMock(spec=ABTest)
        mock_test.id = 1
        mock_test.name = "Test"
        mock_test.status = ABTestStatus.RUNNING
        mock_test.test_type = ABTestType.TEMPLATE_RECOMMENDATION
        mock_test.started_at = datetime.utcnow() - timedelta(days=3)
        mock_test.confidence_level = 0.95
        mock_test.power = 0.8
        mock_test.minimum_detectable_effect = 0.05
        mock_test.required_sample_size = 1000
        mock_test.auto_stop_enabled = True
        mock_test.early_stopping_threshold = 0.95
        
        mock_db.get.return_value = mock_test
        
        # Mock variant query result
        mock_execute_result = MagicMock()
        mock_execute_result.scalars().all.return_value = [mock_control, mock_variant]
        mock_db.execute.return_value = mock_execute_result
        
        # Get results
        results = await ab_framework.get_ab_test_results(1)
        
        # Verify results structure
        assert results["test_id"] == 1
        assert results["status"] == ABTestStatus.RUNNING
        assert "control_variant" in results
        assert "variants" in results
        assert "statistical_analysis" in results
        
        # Check statistical analysis
        stats = results["statistical_analysis"]
        assert stats["total_sample_size"] == 2000
        assert stats["sample_progress"] == 2.0  # 2000/1000 = 2.0
        assert len(stats["comparisons"]) == 1
        
        # Check comparison results
        comparison = stats["comparisons"][0]
        assert comparison["variant_id"] == 2
        assert comparison["variant_name"] == "Variant"
        assert comparison["frequentist"]["variant_rate"] == 0.15
        assert comparison["frequentist"]["control_rate"] == 0.10
        assert comparison["frequentist"]["is_significant"]  # Should be significant
        
    @pytest.mark.asyncio
    async def test_stop_ab_test_with_winner(self, ab_framework, mock_db):
        """Test stopping A/B test and determining winner."""
        
        mock_test = MagicMock(spec=ABTest)
        mock_test.id = 1
        mock_test.status = ABTestStatus.RUNNING
        
        mock_db.get.return_value = mock_test
        mock_db.commit = AsyncMock()
        
        # Mock get_ab_test_results to return significant results
        with patch.object(ab_framework, 'get_ab_test_results') as mock_results:
            mock_results.return_value = {
                "statistical_analysis": {
                    "overall_significance": True,
                    "comparisons": [{
                        "variant_id": 2,
                        "frequentist": {"is_significant": True, "relative_improvement": 25.5}
                    }]
                }
            }
            
            result = await ab_framework.stop_ab_test(1, "Test completed")
        
        # Verify test stopped with winner
        assert result["success"]
        assert result["test_id"] == 1
        assert result["winner_variant_id"] == 2
        assert result["statistical_significance"]
        assert mock_test.status == ABTestStatus.COMPLETED
        assert mock_test.statistical_significance_reached


class TestRecommendationOptimizer:
    """Test recommendation optimization functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return AsyncMock(spec=AsyncSession)
    
    @pytest.fixture
    def optimizer(self, mock_db):
        """Create recommendation optimizer instance."""
        return RecommendationOptimizer(mock_db)
    
    @pytest.mark.asyncio
    async def test_train_optimization_models_insufficient_data(self, optimizer, mock_db):
        """Test model training with insufficient data."""
        
        # Mock insufficient training data
        with patch.object(optimizer, '_prepare_training_data') as mock_prepare:
            mock_prepare.return_value = [{"sample": 1}] * 50  # Only 50 samples
            
            result = await optimizer.train_optimization_models(lookback_days=30)
            
            assert not result["success"]
            assert "Insufficient training data" in result["error"]
    
    @pytest.mark.asyncio
    async def test_train_optimization_models_sufficient_data(self, optimizer, mock_db):
        """Test model training with sufficient data."""
        
        # Mock sufficient training data
        training_samples = []
        for i in range(1000):
            training_samples.append({
                'recommendation_id': f'rec_{i}',
                'session_id': f'session_{i}',
                'algorithm_version': 'v1.0',
                'clicked': np.random.choice([0, 1], p=[0.85, 0.15]),
                'converted': np.random.choice([0, 1], p=[0.95, 0.05]),
                'position': np.random.randint(0, 10),
                'relevance_score': np.random.random()
            })
        
        with patch.object(optimizer, '_prepare_training_data') as mock_prepare:
            mock_prepare.return_value = training_samples
            
            result = await optimizer.train_optimization_models(lookback_days=90)
            
            assert result["success"]
            assert result["training_samples"] == 1000
            assert "click_prediction_auc" in result
            assert "conversion_prediction_auc" in result
            assert "feature_importance" in result
    
    @pytest.mark.asyncio
    async def test_predict_recommendation_performance(self, optimizer, mock_db):
        """Test recommendation performance prediction."""
        
        # Mock template and analytics data
        mock_template = MagicMock(spec=Template)
        mock_template.id = 1
        mock_template.components = [{"type": "hero"}, {"type": "cta"}]
        mock_template.styles = {"colors": {"primary": "#007bff"}}
        mock_template.category = TemplateCategory.LANDING_PAGE
        
        mock_db.get.return_value = mock_template
        
        # Mock analytics query
        mock_execute_result = MagicMock()
        mock_execute_result.scalars().all.return_value = []
        mock_db.execute.return_value = mock_execute_result
        
        # Set models as not trained to test default behavior
        optimizer.models_trained = False
        
        prediction = await optimizer.predict_recommendation_performance(
            template_id=1,
            user_context={"engagement_score": 0.7},
            recommendation_context={"position": 1, "relevance": 0.8}
        )
        
        # Should return default predictions
        assert "click_probability" in prediction
        assert "conversion_probability" in prediction
        assert "confidence" in prediction
        assert prediction["confidence"] == 0.5  # Default for untrained models
    
    @pytest.mark.asyncio
    async def test_optimize_recommendation_algorithm(self, optimizer, mock_db):
        """Test algorithm optimization recommendations."""
        
        # Mock algorithm performance analysis
        with patch.object(optimizer, '_analyze_algorithm_performance') as mock_analyze:
            mock_analyze.return_value = {
                "algorithm_version": "v1.0",
                "click_through_rate": 0.12,
                "conversion_rate": 0.05,
                "total_recommendations": 10000
            }
        
        # Mock feature importance
        optimizer.models_trained = True
        with patch.object(optimizer, '_get_feature_importance') as mock_features:
            mock_features.return_value = {
                "click_prediction_top_features": [(0, 0.3), (1, 0.2)],
                "conversion_prediction_top_features": [(2, 0.4), (3, 0.25)]
            }
        
        # Mock AI service response
        with patch.object(optimizer.ai_service, 'generate_json_response') as mock_ai:
            mock_ai.return_value = {
                "optimizations": {
                    "algorithm_improvements": [
                        {"type": "personalization", "description": "Add user behavior signals"}
                    ],
                    "feature_engineering": [
                        {"feature": "time_of_day", "importance": "high"}
                    ],
                    "parameter_tuning": {"learning_rate": 0.01},
                    "expected_impact": {"ctr_improvement": 0.15, "cvr_improvement": 0.08}
                }
            }
        
        result = await optimizer.optimize_recommendation_algorithm("v1.0", "conversion_rate")
        
        assert "current_performance" in result
        assert "optimization_suggestions" in result
        assert "experiment_config" in result
        assert "implementation_plan" in result


class TestRealTimeMonitor:
    """Test real-time monitoring functionality."""
    
    def test_alert_rule_setup(self):
        """Test alert rules are properly configured."""
        monitor = RealTimeMonitor()
        
        assert len(monitor.alert_rules) > 0
        
        # Check specific rules exist
        rule_names = [rule.name for rule in monitor.alert_rules]
        assert "early_significance" in rule_names
        assert "low_traffic" in rule_names
        assert "conversion_rate_drop" in rule_names
        assert "test_duration_exceeded" in rule_names
    
    def test_performance_divergence_detection(self):
        """Test performance divergence detection."""
        monitor = RealTimeMonitor()
        
        # Test with high divergence
        high_divergence_data = {
            "variants": [
                {"conversion_rate": 0.05, "sample_size": 100},
                {"conversion_rate": 0.15, "sample_size": 100},
                {"conversion_rate": 0.25, "sample_size": 100}
            ]
        }
        
        assert monitor._check_performance_divergence(high_divergence_data)
        
        # Test with low divergence
        low_divergence_data = {
            "variants": [
                {"conversion_rate": 0.14, "sample_size": 100},
                {"conversion_rate": 0.15, "sample_size": 100},
                {"conversion_rate": 0.16, "sample_size": 100}
            ]
        }
        
        assert not monitor._check_performance_divergence(low_divergence_data)
    
    def test_sample_imbalance_detection(self):
        """Test sample allocation imbalance detection."""
        monitor = RealTimeMonitor()
        
        # Test with imbalanced allocation
        imbalanced_data = {
            "variants": [
                {"sample_size": 800},
                {"sample_size": 100},
                {"sample_size": 100}
            ]
        }
        
        assert monitor._check_sample_imbalance(imbalanced_data)
        
        # Test with balanced allocation
        balanced_data = {
            "variants": [
                {"sample_size": 350},
                {"sample_size": 330},
                {"sample_size": 320}
            ]
        }
        
        assert not monitor._check_sample_imbalance(balanced_data)
    
    def test_alert_cooldown_functionality(self):
        """Test alert cooldown prevents spam."""
        monitor = RealTimeMonitor()
        
        # Simulate recent alert
        from app.services.realtime_monitoring import PerformanceAlert
        recent_alert = PerformanceAlert(
            rule_name="early_significance",
            test_id=1,
            severity="medium",
            message="Test message",
            timestamp=datetime.utcnow() - timedelta(minutes=30),
            data={}
        )
        
        monitor.alert_history.append(recent_alert)
        
        # Should be in cooldown (60 minute default for early_significance)
        assert monitor._is_in_cooldown("early_significance", 1)
        
        # Different test should not be in cooldown
        assert not monitor._is_in_cooldown("early_significance", 2)
        
        # Different rule should not be in cooldown
        assert not monitor._is_in_cooldown("low_traffic", 1)


class TestIntegration:
    """Integration tests for the complete A/B testing system."""
    
    @pytest.mark.asyncio
    async def test_end_to_end_ab_test_workflow(self):
        """Test complete A/B test workflow from creation to completion."""
        
        # This would test the complete flow:
        # 1. Create A/B test
        # 2. Start monitoring
        # 3. Record events
        # 4. Check for significance
        # 5. Stop test with results
        
        # Mock database and services
        mock_db = AsyncMock(spec=AsyncSession)
        ab_framework = ABTestingFramework(mock_db)
        
        # Mock test creation
        mock_db.add = MagicMock()
        mock_db.flush = AsyncMock()
        mock_db.commit = AsyncMock()
        
        # Create test (would be more detailed in real implementation)
        algorithm_variants = [
            {"name": "Control", "is_control": True, "algorithm_config": {"version": "v1.0"}},
            {"name": "Variant", "is_control": False, "algorithm_config": {"version": "v1.1"}}
        ]
        
        test_config = {
            "baseline_conversion_rate": 0.15,
            "minimum_detectable_effect": 0.05
        }
        
        # This would run through the complete workflow
        ab_test = await ab_framework.create_recommendation_ab_test(
            name="Integration Test",
            description="End-to-end test",
            algorithm_variants=algorithm_variants,
            test_config=test_config
        )
        
        assert ab_test is not None
        assert ab_test.status == ABTestStatus.DRAFT


if __name__ == "__main__":
    # Run tests with: python -m pytest backend/tests/test_ab_testing_framework.py -v
    pass