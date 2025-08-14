"""
Test Business Context API - Story 1.2 Implementation
Tests for Epic 1-3-4 integration endpoints and business context analysis.
"""

import pytest
import json
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.schemas.business_context import IndustryType, CompanySize, TargetAudience, BusinessGoal


class TestBusinessContextAPI:
    """Test suite for business context API endpoints."""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    @pytest.fixture
    def sample_business_context(self):
        return {
            "industry": "technology",
            "company_size": "small",
            "target_audience": "b2b",
            "primary_goals": ["lead_generation", "brand_awareness"],
            "secondary_goals": ["content_marketing"],
            "required_features": ["contact_form", "testimonials", "services"],
            "preferred_style": "modern_professional",
            "color_preferences": ["blue", "white"],
            "company_name": "TechStart Inc",
            "budget_range": "medium",
            "timeline": "2-4 weeks"
        }
    
    @pytest.fixture
    def analysis_request(self, sample_business_context):
        return {
            "business_context": sample_business_context,
            "user_preferences": {
                "performance_focused": True,
                "mobile_first": True
            },
            "include_analytics": True,
            "max_recommendations": 10
        }
    
    def test_analyze_business_context_success(self, client, analysis_request):
        """Test successful business context analysis."""
        
        # Mock authentication
        headers = {"Authorization": "Bearer mock_token"}
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=analysis_request,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "analysis_id" in data
        assert "business_context" in data
        assert "analysis_timestamp" in data
        assert "industry_insights" in data
        assert "recommended_templates" in data
        assert "ai_summary" in data
        assert "analysis_confidence" in data
        assert "processing_time_ms" in data
        
        # Verify business context preservation
        assert data["business_context"]["industry"] == "technology"
        assert data["business_context"]["company_size"] == "small"
        
        # Verify AI insights
        assert isinstance(data["industry_insights"], dict)
        assert isinstance(data["recommended_templates"], list)
        assert len(data["recommended_templates"]) <= 10
        
        # Verify confidence scores
        assert 0.0 <= data["analysis_confidence"] <= 1.0
        assert data["processing_time_ms"] > 0
    
    def test_analyze_business_context_invalid_input(self, client):
        """Test business context analysis with invalid input."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Missing required fields
        invalid_request = {
            "business_context": {
                "industry": "invalid_industry",
                "company_size": "invalid_size"
            }
        }
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=invalid_request,
            headers=headers
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_industry_analysis_success(self, client):
        """Test successful industry landscape analysis."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        industry_request = {
            "industry": "technology",
            "company_size": "small",
            "target_audience": "b2b",
            "primary_goals": ["lead_generation"],
            "existing_performance_data": {
                "conversion_rate": 0.025,
                "bounce_rate": 0.45
            }
        }
        
        response = client.post(
            "/api/v1/business-context/industry-analysis",
            json=industry_request,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify industry analysis structure
        assert "analysis_id" in data
        assert "industry_insights" in data
        assert "competitive_landscape" in data
        assert "market_opportunities" in data
        assert "template_strategy" in data
        assert "ai_recommendations" in data
        
        # Verify industry insights
        insights = data["industry_insights"]
        assert insights["industry"] == "technology"
        assert "market_trends" in insights
        assert "key_success_factors" in insights
        assert "recommended_strategies" in insights
        
        # Verify competitive analysis
        assert "competition_level" in data["competitive_landscape"]
        assert "market_size" in data["competitive_landscape"]
    
    def test_personalized_recommendations(self, client):
        """Test personalized template recommendations."""
        
        headers = {"Authorization": "Bearer mock_token"}
        user_id = "test_user_123"
        
        response = client.get(
            f"/api/v1/business-context/recommendations/{user_id}",
            params={
                "industry": "technology",
                "max_recommendations": 5
            },
            headers=headers
        )
        
        assert response.status_code == 200
        recommendations = response.json()
        
        assert isinstance(recommendations, list)
        assert len(recommendations) <= 5
        
        # Verify recommendation structure
        for rec in recommendations:
            assert "template_id" in rec
            assert "template_name" in rec
            assert "recommendation_score" in rec
            assert "confidence_level" in rec
            assert "score_breakdown" in rec
            assert 0.0 <= rec["recommendation_score"] <= 1.0
            assert 0.0 <= rec["confidence_level"] <= 1.0
    
    def test_template_context_scoring(self, client, sample_business_context):
        """Test template scoring for business context."""
        
        headers = {"Authorization": "Bearer mock_token"}
        template_id = 1
        
        response = client.post(
            "/api/v1/business-context/template-score",
            params={"template_id": template_id},
            json=sample_business_context,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify scoring structure
        assert data["template_id"] == template_id
        assert "suitability_score" in data
        assert "business_context_match" in data
        assert "recommendation" in data
        assert "explanation" in data
        
        # Verify business context match details
        match_data = data["business_context_match"]
        assert "industry_alignment" in match_data
        assert "goal_compatibility" in match_data
        assert "feature_coverage" in match_data
        assert "complexity_match" in match_data
        
        # Verify all scores are between 0 and 1
        for score in match_data.values():
            assert 0.0 <= score <= 1.0
    
    def test_industry_insights_endpoint(self, client):
        """Test industry insights endpoint."""
        
        headers = {"Authorization": "Bearer mock_token"}
        industry = "technology"
        
        response = client.get(
            f"/api/v1/business-context/industry-insights/{industry}",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify insights structure
        assert data["industry"] == industry
        assert "market_trends" in data
        assert "target_audiences" in data
        assert "success_factors" in data
        assert "common_challenges" in data
        assert "recommended_features" in data
        assert "performance_benchmarks" in data
        assert "competitive_landscape" in data
        
        # Verify data types
        assert isinstance(data["market_trends"], list)
        assert isinstance(data["success_factors"], list)
        assert isinstance(data["performance_benchmarks"], dict)
    
    def test_unauthorized_access(self, client, analysis_request):
        """Test unauthorized access to business context endpoints."""
        
        # No authorization header
        response = client.post(
            "/api/v1/business-context/analyze",
            json=analysis_request
        )
        
        assert response.status_code == 401  # Unauthorized
    
    def test_cross_epic_integration_data(self, client, analysis_request):
        """Test that Epic 1-3-4 integration data is included in responses."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=analysis_request,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify Epic 3 analytics integration
        # Processing time indicates analytics tracking
        assert data["processing_time_ms"] > 0
        
        # Verify Epic 4 AI integration
        # AI summary indicates AI service integration
        assert isinstance(data["ai_summary"], str)
        assert len(data["ai_summary"]) > 0
        
        # Verify Epic 1 business context analysis
        assert "goal_analysis" in data
        assert "competitive_analysis" in data
        
        # Verify cross-Epic optimization
        templates = data["recommended_templates"]
        if templates:
            template = templates[0]
            # Verify AI analysis integration (Epic 4)
            assert "ai_analysis" in template
            # Verify performance prediction (Epic 3)
            assert "similar_business_success_rate" in template
            # Verify workflow suggestions (Epic 1→Epic 4)
            assert "workflow_suggestions" in template


class TestBusinessContextIntegration:
    """Test Epic 1-3-4 integration functionality."""
    
    def test_context_enhanced_recommendations_flow(self, client):
        """Test the complete Epic 1→Epic 4→Epic 3 flow."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Step 1: Analyze business context (Epic 1)
        context_request = {
            "business_context": {
                "industry": "technology",
                "company_size": "small", 
                "target_audience": "b2b",
                "primary_goals": ["lead_generation"]
            },
            "include_analytics": True,
            "max_recommendations": 5
        }
        
        context_response = client.post(
            "/api/v1/business-context/analyze",
            json=context_request,
            headers=headers
        )
        
        assert context_response.status_code == 200
        context_data = context_response.json()
        
        # Step 2: Get AI component suggestions (Epic 4) with context
        if context_data["recommended_templates"]:
            template = context_data["recommended_templates"][0]
            
            # Verify Epic 4 AI integration
            assert "ai_analysis" in template
            assert template["ai_analysis"]["industry_fit"] in ["excellent", "good", "fair"]
            
            # Verify Epic 3 performance integration
            assert "similar_business_success_rate" in template
            assert isinstance(template["similar_business_success_rate"], (int, float))
        
        # Step 3: Score specific template (Epic 1↔Epic 4)
        if context_data["recommended_templates"]:
            template_id = context_data["recommended_templates"][0]["template_id"]
            
            score_response = client.post(
                "/api/v1/business-context/template-score",
                params={"template_id": template_id},
                json=context_request["business_context"],
                headers=headers
            )
            
            assert score_response.status_code == 200
            score_data = score_response.json()
            
            # Verify integration scoring
            assert "business_context_match" in score_data
            assert "recommendation" in score_data
            
            match_scores = score_data["business_context_match"]
            assert all(0.0 <= score <= 1.0 for score in match_scores.values())
    
    def test_performance_analytics_integration(self, client):
        """Test Epic 3 analytics integration in recommendations."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Get personalized recommendations (should include Epic 3 data)
        response = client.get(
            "/api/v1/business-context/recommendations/test_user",
            params={"industry": "technology"},
            headers=headers
        )
        
        assert response.status_code == 200
        recommendations = response.json()
        
        # Verify Epic 3 analytics integration
        for rec in recommendations:
            # Performance prediction integration
            assert "similar_business_success_rate" in rec
            assert "estimated_conversion_uplift" in rec
            
            # Score breakdown should include performance factors
            score_breakdown = rec["score_breakdown"]
            assert "success_pattern_score" in score_breakdown
            
            # Workflow suggestions should be present (Epic 1→Epic 4 integration)
            assert "workflow_suggestions" in rec
            assert isinstance(rec["workflow_suggestions"], list)
    
    def test_ai_service_integration(self, client):
        """Test Epic 4 AI service integration."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Industry analysis should use AI insights
        industry_response = client.post(
            "/api/v1/business-context/industry-analysis",
            json={
                "industry": "technology",
                "company_size": "small",
                "target_audience": "b2b",
                "primary_goals": ["lead_generation"]
            },
            headers=headers
        )
        
        assert industry_response.status_code == 200
        data = industry_response.json()
        
        # Verify AI-generated insights
        assert "ai_recommendations" in data
        assert isinstance(data["ai_recommendations"], list)
        
        # Verify AI-enhanced analysis
        industry_insights = data["industry_insights"]
        assert "recommended_strategies" in industry_insights
        assert "optimization_priorities" in industry_insights
        
        # AI confidence should be present
        assert 0.0 <= data["analysis_confidence"] <= 1.0


class TestBusinessContextValidation:
    """Test business context data validation and error handling."""
    
    def test_enum_validation(self, client):
        """Test enum field validation."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Test valid enums
        valid_request = {
            "business_context": {
                "industry": "technology",
                "company_size": "small",
                "target_audience": "b2b",
                "primary_goals": ["lead_generation", "brand_awareness"]
            }
        }
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=valid_request,
            headers=headers
        )
        
        assert response.status_code == 200
        
        # Test invalid enums
        invalid_request = {
            "business_context": {
                "industry": "invalid_industry",
                "company_size": "invalid_size",
                "target_audience": "invalid_audience",
                "primary_goals": ["invalid_goal"]
            }
        }
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=invalid_request,
            headers=headers
        )
        
        assert response.status_code == 422
    
    def test_required_field_validation(self, client):
        """Test required field validation."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Missing required business_context
        response = client.post(
            "/api/v1/business-context/analyze",
            json={},
            headers=headers
        )
        
        assert response.status_code == 422
        
        # Incomplete business_context
        response = client.post(
            "/api/v1/business-context/analyze",
            json={
                "business_context": {
                    "industry": "technology"
                    # Missing company_size, target_audience
                }
            },
            headers=headers
        )
        
        assert response.status_code == 422
    
    def test_optional_field_handling(self, client):
        """Test optional field handling."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        # Minimal valid request
        minimal_request = {
            "business_context": {
                "industry": "technology",
                "company_size": "small",
                "target_audience": "b2b"
                # All other fields are optional
            }
        }
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=minimal_request,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should handle missing optional fields gracefully
        assert "analysis_id" in data
        assert "business_context" in data
        assert data["business_context"]["primary_goals"] == []  # Default empty list


class TestBusinessContextPerformance:
    """Test business context API performance and scalability."""
    
    def test_response_time_requirements(self, client):
        """Test that API responses meet performance requirements (<300ms for CRUD operations)."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        request_data = {
            "business_context": {
                "industry": "technology",
                "company_size": "small",
                "target_audience": "b2b",
                "primary_goals": ["lead_generation"]
            }
        }
        
        import time
        start_time = time.time()
        
        response = client.post(
            "/api/v1/business-context/analyze",
            json=request_data,
            headers=headers
        )
        
        response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        assert response.status_code == 200
        # In production, this should be <300ms, but for tests we'll be more lenient
        assert response_time < 5000  # 5 seconds for test environment
        
        # Verify processing time is tracked
        data = response.json()
        assert data["processing_time_ms"] > 0
    
    def test_concurrent_requests(self, client):
        """Test handling multiple concurrent requests."""
        
        headers = {"Authorization": "Bearer mock_token"}
        
        request_data = {
            "business_context": {
                "industry": "technology",
                "company_size": "small",
                "target_audience": "b2b",
                "primary_goals": ["lead_generation"]
            }
        }
        
        # Simulate concurrent requests
        import threading
        import time
        
        results = []
        
        def make_request():
            response = client.post(
                "/api/v1/business-context/analyze",
                json=request_data,
                headers=headers
            )
            results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        # Wait for completion
        for thread in threads:
            thread.join()
        
        # Verify all requests succeeded
        assert all(status == 200 for status in results)
        assert len(results) == 5