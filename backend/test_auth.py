#!/usr/bin/env python3
"""
Test authentication endpoints
"""

import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def generate_unique_email():
    """Generate a unique email for testing"""
    return f"test_{uuid.uuid4().hex[:8]}@example.com"

def test_health():
    """Test basic health check"""
    print("Testing health endpoint...")
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response

def test_register(email=None, password="testpassword123"):
    """Test user registration"""
    print("Testing user registration...")
    
    # Generate unique email if not provided
    if email is None:
        email = generate_unique_email()
    
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response, email, password

def test_login(email, password):
    """Test user login"""
    print("\nTesting user login...")
    
    # Test with JSON payload
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=data)
    print(f"Status Code (JSON): {response.status_code}")
    if response.status_code == 200:
        print(f"Access Token: {response.json().get('access_token')}")
        print(f"User ID: {response.json().get('user', {}).get('id')}")
    else:
        print(f"Response: {response.json()}")
    return response

def test_protected_endpoint(token):
    """Test accessing a protected endpoint with token"""
    print("\nTesting protected endpoint access...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/v1/users/me", headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Successfully accessed protected endpoint")
    else:
        print(f"Response: {response.json()}")
    return response

def run_complete_auth_flow():
    """Run complete authentication flow: register -> login -> access protected endpoint"""
    print("=" * 50)
    print("Running Complete Authentication Flow Test")
    print("=" * 50)
    
    # Test health first
    health_response = test_health()
    if health_response.status_code != 200:
        print("Health check failed. Aborting tests.")
        return
    
    # Test registration
    register_response, email, password = test_register()
    
    # Test login
    if register_response.status_code in [200, 201]:
        print("\nRegistration successful, proceeding to login...")
        login_response = test_login(email, password)
        
        # Test protected endpoint if login was successful
        if login_response.status_code == 200:
            token = login_response.json().get('access_token')
            if token:
                test_protected_endpoint(token)
    elif register_response.status_code == 400:
        print("\nUser already exists, testing login with existing user...")
        login_response = test_login(email, password)
        
        # Test protected endpoint if login was successful
        if login_response.status_code == 200:
            token = login_response.json().get('access_token')
            if token:
                test_protected_endpoint(token)
    
    print("\n" + "=" * 50)
    print("Authentication Flow Test Complete")
    print("=" * 50)

if __name__ == "__main__":
    try:
        run_complete_auth_flow()
    except Exception as e:
        print(f"Error testing endpoints: {e}")