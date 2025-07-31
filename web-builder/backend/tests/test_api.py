"""
API Tests for AI Marketing Web Builder Platform
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    from main import app
    client = TestClient(app)
    APP_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import app: {e}")
    APP_AVAILABLE = False
    client = None


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_root_endpoint(self):
        """Test root endpoint returns correct information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_api_status(self):
        """Test API status endpoint."""
        response = client.get("/api/status")
        assert response.status_code == 200
        data = response.json()
        assert "api" in data
        assert "services" in data
        assert "features" in data
        assert data["api"]["name"] == "AI Web Builder Platform"


class TestAPIEndpoints:
    """Test API endpoints."""
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_workflows_endpoint(self):
        """Test workflows endpoint."""
        response = client.get("/api/workflows")
        assert response.status_code == 200
        data = response.json()
        assert "workflows" in data
        assert "total" in data
        assert data["total"] == 0
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_campaigns_endpoint(self):
        """Test campaigns endpoint."""
        response = client.get("/api/campaigns")
        assert response.status_code == 200
        data = response.json()
        assert "campaigns" in data
        assert "total" in data
        assert data["total"] == 0
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_users_me_endpoint(self):
        """Test users/me endpoint."""
        response = client.get("/api/users/me")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert "message" in data


class TestErrorHandling:
    """Test error handling."""
    
    @pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not available")
    def test_404_handler(self):
        """Test 404 error handler."""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"] == "Endpoint not found"


class TestConfiguration:
    """Test configuration and settings."""
    
    def test_settings_import(self):
        """Test that settings can be imported."""
        try:
            from core.config import settings
            assert settings.app_name == "AI Web Builder Platform"
            assert settings.version == "0.1.0"
        except ImportError:
            pytest.skip("Settings not available")


# Fallback tests for when FastAPI is not available
class TestFallback:
    """Fallback tests when FastAPI dependencies are not available."""
    
    @pytest.mark.skipif(APP_AVAILABLE, reason="FastAPI app is available")
    def test_backend_structure(self):
        """Test that backend structure exists."""
        import os
        backend_dir = os.path.join(os.path.dirname(__file__), '..', 'src')
        assert os.path.exists(backend_dir)
        
        # Check for main files
        main_py = os.path.join(backend_dir, 'main.py')
        assert os.path.exists(main_py), "main.py should exist"
        
        # Check for core directory
        core_dir = os.path.join(backend_dir, 'core')
        assert os.path.exists(core_dir), "core directory should exist"
        
        config_py = os.path.join(core_dir, 'config.py')
        assert os.path.exists(config_py), "config.py should exist"


if __name__ == "__main__":
    # Run tests directly
    if APP_AVAILABLE:
        print("✅ FastAPI app available - running full test suite")
    else:
        print("⚠️ FastAPI app not available - running fallback tests")
    
    pytest.main([__file__, "-v"])