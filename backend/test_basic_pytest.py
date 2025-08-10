"""
Basic pytest test to verify environment is working.
"""

import pytest
import sys
import os

# Add backend to path
backend_path = '/mnt/d/s7s-projects/AI-Marketing-Web-Builder/backend'
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

def test_python_version():
    """Test Python version is adequate."""
    assert sys.version_info >= (3, 8)

def test_basic_imports():
    """Test basic imports work."""
    import fastapi
    import uvicorn
    import pydantic
    import sqlalchemy
    import pytest
    import httpx
    
    assert fastapi is not None
    assert uvicorn is not None
    assert pydantic is not None
    assert sqlalchemy is not None
    assert pytest is not None
    assert httpx is not None

def test_model_imports():
    """Test model imports work."""
    from app.models.base import Base, TimestampMixin, UUIDMixin
    from app.models.user import User
    from app.models.template import Template
    
    assert Base is not None
    assert TimestampMixin is not None
    assert UUIDMixin is not None
    assert User is not None
    assert Template is not None

def test_fastapi_basic():
    """Test basic FastAPI functionality."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    
    app = FastAPI()
    
    @app.get("/")
    def read_root():
        return {"message": "Hello World"}
    
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

if __name__ == "__main__":
    pytest.main([__file__, "-v"])