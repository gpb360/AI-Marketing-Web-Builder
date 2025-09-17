"""
Test Authentication API Endpoints
Tests for /api/v1/auth/login, /api/v1/auth/register, /api/v1/auth/refresh
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


class TestAuthAPIEndpoints:
    """Test suite for authentication API endpoints."""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    @pytest.fixture
    def valid_user_data(self):
        return {
            "email": "test@example.com",
            "password": "securepassword123",
            "name": "Test User"
        }
    
    def test_user_registration_success(self, client, valid_user_data):
        """Test successful user registration."""
        response = client.post("/api/v1/auth/register", json=valid_user_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user" in data
        assert "token" in data
        assert data["user"]["email"] == valid_user_data["email"]
        assert data["user"]["name"] == valid_user_data["name"]
        assert "id" in data["user"]
        
        print("✅ User registration endpoint working")
    
    def test_user_registration_invalid_data(self, client):
        """Test user registration with invalid data."""
        invalid_data = {
            "email": "invalid-email",
            "password": "123",  # Too short
            "name": ""  # Empty name
        }
        
        response = client.post("/api/v1/auth/register", json=invalid_data)
        
        assert response.status_code == 422  # Validation error
        
        print("✅ User registration validation working")
    
    def test_user_login_success(self, client, valid_user_data):
        """Test successful user login."""
        # First register a user
        client.post("/api/v1/auth/register", json=valid_user_data)
        
        # Then login
        login_data = {
            "email": valid_user_data["email"],
            "password": valid_user_data["password"]
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user" in data
        assert "token" in data
        assert data["user"]["email"] == valid_user_data["email"]
        
        print("✅ User login endpoint working")
    
    def test_user_login_invalid_credentials(self, client):
        """Test user login with invalid credentials."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401  # Unauthorized
        
        print("✅ User login authentication working")
    
    def test_token_refresh_success(self, client, valid_user_data):
        """Test successful token refresh."""
        # First register and login to get tokens
        client.post("/api/v1/auth/register", json=valid_user_data)
        login_response = client.post("/api/v1/auth/login", json={
            "email": valid_user_data["email"],
            "password": valid_user_data["password"]
        })
        
        refresh_token = login_response.json()["token"]["refresh_token"]
        
        # Refresh token
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["access_token"] != ""
        assert data["refresh_token"] != refresh_token  # New refresh token
        
        print("✅ Token refresh endpoint working")
    
    def test_token_refresh_invalid_token(self, client):
        """Test token refresh with invalid token."""
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_token"
        })
        
        assert response.status_code == 401  # Unauthorized
        
        print("✅ Token refresh validation working")