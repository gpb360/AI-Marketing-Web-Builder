"""
Comprehensive tests for scenario modeling system.
Tests advanced AI-powered scenario generation, optimization, and prediction capabilities.
"""

import pytest
import json
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
from typing import Dict, List, Any

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.testclient import TestClient

from app.services.scenario_modeling_service import ScenarioModelingService, AdvancedScenarioPredictor
from app.models.scenario_modeling import (
    ScenarioModelingConfiguration, ScenarioModel, ScenarioPrediction,
    OptimizationRecommendation, ScenarioType, OptimizationObjective
)
from app.schemas.scenario_modeling import ScenarioModelingRequest


class TestAdvancedScenarioPredictor:
    """Test advanced ML-based scenario predictor."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.predictor = AdvancedScenarioPredictor()
        
    def test_extract_advanced_features(self):
        """Test feature extraction from template configuration."""
        template_config = {
            'components': [
                {'type': 'hero'}, {'type': 'cta'}, {'type': 'form'}, 
                {'type': 'testimonial'}, {'type': 'pricing'}
            ],
            'layout': {'responsive': True, 'columns': 2, 'sticky_header': True, 'loading_speed_score': 85},
            'content': {
                'headlines': ['Main Title', 'Subtitle'],
                'value_propositions': ['Fast', 'Reliable', 'Affordable'],
                'readability_score': 75,
                'sentiment_score': 0.8
            }
        }
        
        business_context = {
            'industry': 'saas',
            'business_model': 'b2b',
            'company_size_employees': 50,
            'marketing_budget_monthly': 5000,
            'marketing_maturity_score': 0.7
        }
        
        market_conditions = {
            'competition_intensity': 0.6,
            'market_growth_rate': 0.15,
            'seasonal_factor': 1.1,
            'economic_index': 0.95
        }
        
        features = self.predictor.extract_advanced_features(
            template_config, business_context, market_conditions
        )
        
        assert features.shape == (1, 25)  # Expected number of features
        assert features[0, 0] == 5  # Component count
        assert features[0, 1] == 1  # Hero sections count
        assert features[0, 6] == 1  # Responsive layout
        
    def test_predict_outcome_with_trained_model(self):
        """Test outcome prediction with trained ML model."""
        # Mock trained model
        self.predictor.is_trained['conversion_rate'] = True
        self.predictor.scalers['conversion_rate'] = MagicMock()
        self.predictor.scalers['conversion_rate'].transform.return_value = [[0.5, 0.3, 0.8]]
        self.predictor.models['conversion_rate'] = MagicMock()
        self.predictor.models['conversion_rate'].predict.return_value = [0.15]
        self.predictor.models['conversion_rate'].feature_importances_ = [0.3, 0.2, 0.5]
        
        template_config = {'components': [], 'config': {}}
        business_context = {'industry': 'saas'}
        market_conditions = {'competition_intensity': 0.5}
        
        result = self.predictor.predict_outcome(
            template_config, business_context, market_conditions, 'conversion_rate'
        )
        
        assert 'predicted_value' in result
        assert 'confidence_interval_lower' in result
        assert 'confidence_interval_upper' in result
        assert 'model_confidence' in result
        assert result['predicted_value'] == 0.15
        
    def test_baseline_prediction_fallback(self):
        """Test fallback to baseline predictions when model not trained."""
        template_config = {'components': [], 'config': {}}
        business_context = {'industry': 'ecommerce'}
        market_conditions = {}
        
        result = self.predictor.predict_outcome(
            template_config, business_context, market_conditions, 'revenue'
        )
        
        assert result['predicted_value'] == 10000.0  # Baseline revenue
        assert result['model_confidence'] == 0.3  # Low confidence for baseline
        assert result['confidence_interval_lower'] < result['predicted_value']
        assert result['confidence_interval_upper'] > result['predicted_value']


class TestScenarioModelingService:
    """Test scenario modeling service functionality."""
    
    @pytest.fixture
    async def mock_db_session(self):
        """Create mock database session."""
        session = AsyncMock(spec=AsyncSession)
        return session
        
    @pytest.fixture
    async def service(self, mock_db_session):
        """Create scenario modeling service instance."""
        return ScenarioModelingService(mock_db_session)
        
    @pytest.fixture
    def sample_request(self):
        """Create sample scenario modeling request."""
        return ScenarioModelingRequest(
            name="Test Scenario Configuration",
            description="Testing scenario modeling capabilities",
            template_id="test_template_123",
            scenario_type=ScenarioType.CONVERSION_RATE,
            optimization_objective=OptimizationObjective.CONVERSION_RATE,
            base_configuration={
                "layout": "single_column",
                "cta_color": "blue",
                "form_fields": 3
            },
            variable_parameters={
                "cta_size": {"min": 0.8, "max": 1.5},
                "headline_emphasis": {"min": 0.5, "max": 1.0}
            },
            constraint_parameters={
                "max_form_fields": 5,
                "mobile_optimized": True
            },
            business_context={
                "industry": "saas",
                "target_revenue": 100000,
                "current_conversion_rate": 0.12
            },
            target_audience={
                "primary": "B2B decision makers",
                "secondary": "Technical evaluators"
            },
            industry_data={
                "average_conversion_rate": 0.15,
                "competitive_landscape": "high"
            }
        )
        
    async def test_create_scenario_configuration(self, service, sample_request, mock_db_session):
        """Test creating scenario modeling configuration with AI enhancements."""
        # Mock template service
        mock_template = MagicMock()
        mock_template.name = "Test Template"
        mock_template.category = "landing_page"
        mock_template.components = []
        mock_template.performance_score = 0.75
        
        service.template_service.get_by_id = AsyncMock(return_value=mock_template)
        
        # Mock AI service response
        with patch.object(service.ai_service, '__aenter__') as mock_ai_enter:
            mock_ai = AsyncMock()
            mock_ai.generate_json_response = AsyncMock(return_value={
                "recommended_parameters": {
                    "cta_prominence": 0.9,
                    "social_proof": 0.7
                },
                "enhancements": [
                    "Added trust signals optimization",
                    "Enhanced mobile responsiveness"
                ],
                "suggestions": [
                    "Consider A/B testing headline variations",
                    "Implement urgency messaging"
                ]
            })
            mock_ai_enter.return_value = mock_ai
            
            result = await service.create_scenario_configuration(sample_request)
            
            assert result["success"] is True
            assert "configuration_id" in result
            assert "ai_enhancements" in result
            assert len(result["ai_enhancements"]) == 2
            
            # Verify database interactions
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
            
    async def test_generate_ai_scenarios(self, service):
        """Test AI-powered scenario generation."""
        # Create mock configuration
        config = MagicMock()
        config.base_configuration = {"cta_color": "blue"}
        config.business_context = {"industry": "saas"}
        config.optimization_objective = OptimizationObjective.CONVERSION_RATE
        config.scenario_type = ScenarioType.TRAFFIC_VOLUME
        
        # Mock AI service
        with patch.object(service.ai_service, '__aenter__') as mock_ai_enter:
            mock_ai = AsyncMock()
            mock_ai.generate_json_response = AsyncMock(return_value={
                "scenarios": [
                    {
                        "name": "High Conversion CTA",
                        "description": "Optimized for maximum conversion rates",
                        "parameters": {"cta_prominence": 0.9},
                        "template_modifications": {"cta_size": "large"},
                        "context_variables": {"focus": "conversion"},
                        "priority": 95,
                        "expected_lift": 0.25,
                        "confidence_score": 0.85,
                        "test_hypothesis": "Larger CTAs increase conversion rates",
                        "success_metrics": ["conversion_rate", "click_through_rate"],
                        "audience_fit": 0.9
                    },
                    {
                        "name": "Engagement Optimized",
                        "description": "Focused on user engagement",
                        "parameters": {"content_depth": 0.8},
                        "template_modifications": {"interactive_elements": True},
                        "context_variables": {"focus": "engagement"},
                        "priority": 80,
                        "expected_lift": 0.18,
                        "confidence_score": 0.75,
                        "test_hypothesis": "Interactive elements improve engagement",
                        "success_metrics": ["time_on_page", "engagement_rate"],
                        "audience_fit": 0.8
                    }
                ]
            })
            mock_ai_enter.return_value = mock_ai
            
            scenarios = await service._generate_ai_scenarios(config, 2, 0.7)
            
            assert len(scenarios) == 2
            assert scenarios[0]["name"] == "High Conversion CTA"
            assert scenarios[0]["expected_lift"] == 0.25
            assert scenarios[1]["confidence_score"] == 0.75
            
    async def test_what_if_analysis(self, service, mock_db_session):
        """Test comprehensive what-if analysis."""
        # Mock configuration
        mock_config = MagicMock()
        mock_config.id = "config_123"
        mock_config.business_context = {"industry": "saas"}
        mock_config.base_configuration = {"cta_color": "blue"}
        
        service._get_configuration = AsyncMock(return_value=mock_config)
        
        # Mock predictor responses
        service.predictor.predict_outcome = MagicMock(return_value={
            "predicted_value": 0.18,
            "confidence_interval_lower": 0.15,
            "confidence_interval_upper": 0.22,
            "model_confidence": 0.85
        })
        
        modifications = {
            "cta_color": "red",
            "cta_size": 1.2,
            "form_fields": 2
        }
        
        result = await service.what_if_analysis("config_123", modifications)
        
        assert result["success"] is True
        assert "what_if_scenario" in result
        assert "predictions" in result
        assert "confidence_score" in result
        assert result["confidence_score"] == 0.85
        
        # Check scenario details
        scenario = result["what_if_scenario"]
        assert "What-If Analysis" in scenario["name"]
        assert scenario["parameters"] == modifications
        
    async def test_sensitivity_analysis(self, service, mock_db_session):
        """Test parameter sensitivity analysis."""
        # Mock configuration
        mock_config = MagicMock()
        mock_config.variable_parameters = {
            "cta_prominence": {"min": 0.5, "max": 1.0},
            "form_simplicity": {"min": 0.3, "max": 0.9}
        }
        mock_config.base_configuration = {"cta_color": "blue"}
        mock_config.business_context = {"industry": "ecommerce"}
        
        service._get_configuration = AsyncMock(return_value=mock_config)
        
        # Mock predictor with different outcomes for variations
        def mock_predict_outcome(template_config, business_context, market_conditions, prediction_type):
            # Return different values based on parameter values
            cta_prominence = template_config.get('parameters', {}).get('cta_prominence', 0.75)
            base_conversion = 0.15
            effect = (cta_prominence - 0.75) * 0.1  # Linear relationship
            return {"predicted_value": base_conversion + effect}
            
        service.predictor.predict_outcome = MagicMock(side_effect=mock_predict_outcome)
        
        result = await service.sensitivity_analysis("config_123")
        
        assert result["success"] is True
        assert "sensitivity_results" in result
        assert "most_sensitive_parameter" in result
        
        # Check sensitivity analysis for cta_prominence
        sensitivity_data = result["sensitivity_results"]["cta_prominence"]
        assert sensitivity_data["parameter"] == "cta_prominence"
        assert "sensitivity_score" in sensitivity_data
        assert len(sensitivity_data["outcomes"]) == 5  # -50%, -25%, 0%, +25%, +50%
        
    async def test_automated_optimization(self, service, mock_db_session):
        """Test automated optimization with genetic algorithm."""
        # Mock configuration
        mock_config = MagicMock()
        mock_config.variable_parameters = {
            "param1": {"min": 0, "max": 1},
            "param2": {"min": 0, "max": 1}
        }
        mock_config.base_configuration = {}
        mock_config.business_context = {"industry": "saas"}
        
        service._get_configuration = AsyncMock(return_value=mock_config)
        
        with patch('app.services.scenario_modeling_service.differential_evolution') as mock_de:
            # Mock optimization result
            mock_result = MagicMock()
            mock_result.x = [0.8, 0.6]
            mock_result.fun = -0.25  # Negative because we minimize
            mock_de.return_value = mock_result
            
            result = await service.run_automated_optimization("config_123", "genetic_algorithm", 50)
            
            assert result["success"] is True
            assert "optimal_parameters" in result
            assert "expected_improvement" in result
            
            optimal_params = result["optimal_parameters"]
            assert optimal_params["param1"] == 0.8
            assert optimal_params["param2"] == 0.6
            
    async def test_performance_forecast(self, service, mock_db_session):
        """Test performance forecasting functionality."""
        # Mock configuration and scenarios
        mock_config = MagicMock()
        mock_config.id = "config_123"
        
        mock_scenario = MagicMock()
        mock_scenario.id = "scenario_456"
        mock_scenario.template_modifications = {"cta_size": "large"}
        mock_scenario.context_variables = {"optimization_focus": "conversion"}
        
        service._get_configuration = AsyncMock(return_value=mock_config)
        service._get_scenarios_by_config = AsyncMock(return_value=[mock_scenario])
        
        result = await service.generate_performance_forecast("config_123", 60, 0.95)
        
        assert result["success"] is True
        assert "scenario_forecasts" in result
        assert "forecast_horizon_days" in result
        assert result["forecast_horizon_days"] == 60
        
        # Check forecast structure
        forecasts = result["scenario_forecasts"]
        assert "scenario_456" in forecasts
        
        scenario_forecast = forecasts["scenario_456"]
        assert "forecast_points" in scenario_forecast
        assert "confidence_intervals" in scenario_forecast
        assert len(scenario_forecast["forecast_points"]) == 60
        
    async def test_export_scenario_analysis(self, service, mock_db_session):
        """Test comprehensive data export functionality."""
        # Mock configuration
        mock_config = MagicMock()
        mock_config.id = "config_123"
        mock_config.name = "Test Configuration"
        mock_config.description = "Test description"
        mock_config.scenario_type = ScenarioType.CONVERSION_RATE
        mock_config.optimization_objective = OptimizationObjective.CONVERSION_RATE
        mock_config.created_at = datetime.utcnow()
        mock_config.business_context = {"industry": "saas"}
        mock_config.target_audience = {"primary": "B2B"}
        
        # Mock scenarios
        mock_scenario = MagicMock()
        mock_scenario.id = "scenario_456"
        mock_scenario.name = "Test Scenario"
        mock_scenario.description = "Test scenario description"
        mock_scenario.parameters = {"cta_size": 1.2}
        mock_scenario.template_modifications = {"cta_color": "red"}
        mock_scenario.is_baseline = False
        mock_scenario.confidence_score = 0.85
        mock_scenario.execution_priority = 90
        
        # Mock predictions
        mock_prediction = MagicMock()
        mock_prediction.prediction_type = "conversion_rate"
        mock_prediction.predicted_value = 0.18
        mock_prediction.confidence_interval_lower = 0.15
        mock_prediction.confidence_interval_upper = 0.22
        mock_prediction.confidence_level = 0.95
        
        service._get_configuration = AsyncMock(return_value=mock_config)
        service._get_scenarios_by_config = AsyncMock(return_value=[mock_scenario])
        service._get_predictions_by_scenario = AsyncMock(return_value=[mock_prediction])
        
        # Mock database query for recommendations
        mock_db_session.execute = AsyncMock()
        mock_db_session.execute.return_value.scalars.return_value.all.return_value = []
        
        result = await service.export_scenario_analysis("config_123", "json", True, True)
        
        assert result["success"] is True
        assert "export_data" in result
        
        export_data = result["export_data"]
        assert export_data["configuration"]["name"] == "Test Configuration"
        assert len(export_data["scenarios"]) == 1
        assert export_data["scenarios"][0]["predictions"][0]["type"] == "conversion_rate"
        assert "summary_statistics" in export_data
        
    def test_fallback_scenarios_industry_specific(self, service):
        """Test industry-specific fallback scenario generation."""
        # Test SaaS industry scenarios
        mock_config = MagicMock()
        mock_config.business_context = {"industry": "saas"}
        mock_config.optimization_objective = OptimizationObjective.CONVERSION_RATE
        
        scenarios = service._generate_fallback_scenarios(mock_config, 3)
        
        assert len(scenarios) <= 3
        assert any("SaaS" in scenario["name"] for scenario in scenarios)
        assert any("trial" in scenario["description"].lower() for scenario in scenarios)
        
        # Test E-commerce industry scenarios
        mock_config.business_context = {"industry": "ecommerce"}
        scenarios = service._generate_fallback_scenarios(mock_config, 3)
        
        assert any("Purchase" in scenario["name"] or "Social Proof" in scenario["name"] 
                  for scenario in scenarios)
        assert any("urgency" in scenario["description"].lower() or 
                  "social" in scenario["description"].lower() 
                  for scenario in scenarios)
        
    def test_implementation_complexity_assessment(self, service):
        """Test implementation complexity assessment."""
        # Low complexity modifications
        simple_modifications = {
            "cta_color": "red",
            "font_size": 16
        }
        
        complexity = service._assess_implementation_complexity(simple_modifications)
        assert complexity == "low"
        
        # High complexity modifications
        complex_modifications = {
            "layout": "multi_column",
            "components": ["hero", "testimonials", "pricing"],
            "navigation": "sticky",
            "structure": "redesign",
            "interactive_elements": True,
            "user_flow": "optimized"
        }
        
        complexity = service._assess_implementation_complexity(complex_modifications)
        assert complexity == "high"
        
    def test_risk_assessment(self, service):
        """Test modification risk assessment."""
        # Low risk modifications
        low_risk_mods = {"color": "blue", "font_weight": "bold"}
        risk_assessment = service._assess_modification_risks(low_risk_mods)
        
        assert risk_assessment["technical_risk"] == "low"
        assert risk_assessment["overall_risk_score"] < 0.3
        
        # High risk modifications
        high_risk_mods = {
            "layout": "complete_redesign",
            "form_fields": "restructure",
            "navigation": "overhaul",
            "cta_placement": "experimental"
        }
        risk_assessment = service._assess_modification_risks(high_risk_mods)
        
        assert risk_assessment["technical_risk"] in ["medium", "high"]
        assert risk_assessment["overall_risk_score"] > 0.5


class TestScenarioModelingAPI:
    """Test API endpoints for scenario modeling."""
    
    @pytest.fixture
    def client(self):
        """Create test client."""
        from app.main import app
        return TestClient(app)
        
    @pytest.fixture
    def auth_headers(self):
        """Create authentication headers."""
        return {"Authorization": "Bearer test_token"}
        
    def test_create_configuration_endpoint(self, client, auth_headers):
        """Test scenario configuration creation endpoint."""
        payload = {
            "name": "Test Configuration",
            "description": "API test configuration",
            "template_id": "template_123",
            "scenario_type": "conversion_rate",
            "optimization_objective": "conversion_rate",
            "base_configuration": {"cta_color": "blue"},
            "business_context": {"industry": "saas"}
        }
        
        with patch('app.api.v1.endpoints.scenario_modeling.ScenarioModelingService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service.create_scenario_configuration = AsyncMock(return_value={
                "success": True,
                "configuration_id": "config_456",
                "ai_enhancements": ["Enhanced CTA optimization"],
                "optimization_suggestions": ["Test A/B variants"]
            })
            mock_service_class.return_value = mock_service
            
            response = client.post(
                "/api/v1/scenario-modeling/configurations",
                json=payload,
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "configuration_id" in data
            assert "next_steps" in data
            
    def test_what_if_analysis_endpoint(self, client, auth_headers):
        """Test what-if analysis endpoint."""
        payload = {
            "modifications": {
                "cta_color": "red",
                "form_fields": 2
            },
            "comparison_scenarios": ["scenario_123"],
            "simulation_runs": 500
        }
        
        with patch('app.api.v1.endpoints.scenario_modeling.ScenarioModelingService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service.what_if_analysis = AsyncMock(return_value={
                "success": True,
                "confidence_score": 0.85,
                "predictions": {"conversion_rate": {"predicted_value": 0.18}},
                "insights": ["High confidence prediction"]
            })
            mock_service_class.return_value = mock_service
            
            response = client.post(
                "/api/v1/scenario-modeling/what-if/config_123",
                json=payload,
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["implementation_recommendation"] == "high_priority"
            assert "analysis_results" in data
            
    def test_automated_optimization_endpoint(self, client, auth_headers):
        """Test automated optimization endpoint."""
        with patch('app.api.v1.endpoints.scenario_modeling.ScenarioModelingService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service.run_automated_optimization = AsyncMock(return_value={
                "success": True,
                "optimal_parameters": {"param1": 0.8, "param2": 0.6},
                "expected_improvement": 0.25,
                "confidence_score": 0.82
            })
            mock_service_class.return_value = mock_service
            
            response = client.post(
                "/api/v1/scenario-modeling/optimize/config_123?optimization_method=genetic_algorithm&max_iterations=100",
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "optimal_parameters" in data
            assert data["expected_improvement"] == "25.0%"
            
    def test_sensitivity_analysis_endpoint(self, client, auth_headers):
        """Test sensitivity analysis endpoint."""
        payload = {
            "parameters_to_analyze": ["cta_prominence", "form_simplicity"]
        }
        
        with patch('app.api.v1.endpoints.scenario_modeling.ScenarioModelingService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service.sensitivity_analysis = AsyncMock(return_value={
                "success": True,
                "most_sensitive_parameter": "cta_prominence",
                "parameters_analyzed": ["cta_prominence", "form_simplicity"],
                "sensitivity_results": {
                    "cta_prominence": {"sensitivity_score": 0.85}
                }
            })
            mock_service_class.return_value = mock_service
            
            response = client.post(
                "/api/v1/scenario-modeling/sensitivity/config_123",
                json=payload,
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["most_sensitive_parameter"] == "cta_prominence"
            
    def test_export_analysis_endpoint(self, client, auth_headers):
        """Test export analysis endpoint."""
        with patch('app.api.v1.endpoints.scenario_modeling.ScenarioModelingService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service.export_scenario_analysis = AsyncMock(return_value={
                "success": True,
                "export_data": {
                    "configuration": {"name": "Test Config"},
                    "scenarios": [],
                    "summary_statistics": {}
                },
                "download_ready": True,
                "file_size_estimate": 15420
            })
            mock_service_class.return_value = mock_service
            
            response = client.get(
                "/api/v1/scenario-modeling/export/config_123?export_format=json&include_predictions=true",
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["download_ready"] is True
            assert "15,420 bytes" in data["file_size_estimate"]


class TestIntegrationScenarios:
    """Test integration scenarios and edge cases."""
    
    async def test_end_to_end_scenario_workflow(self):
        """Test complete scenario modeling workflow."""
        # This would test the full workflow:
        # 1. Create configuration
        # 2. Generate scenarios
        # 3. Run predictions
        # 4. Generate recommendations
        # 5. Perform what-if analysis
        # 6. Export results
        pass  # Implementation would require full database setup
        
    def test_concurrent_analysis_handling(self):
        """Test handling of concurrent analysis requests."""
        # Test that multiple simultaneous requests are handled correctly
        pass  # Would test with actual async execution
        
    def test_large_dataset_performance(self):
        """Test performance with large datasets."""
        # Test scenario generation and analysis with large parameter spaces
        pass  # Would require performance benchmarks
        
    def test_error_recovery_mechanisms(self):
        """Test error recovery in complex scenarios."""
        # Test AI service failures, database errors, etc.
        pass  # Would test various failure modes


if __name__ == "__main__":
    # Run specific test categories
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--durations=10"
    ])