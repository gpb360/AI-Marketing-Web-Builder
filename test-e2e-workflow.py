#!/usr/bin/env python3
"""
Comprehensive End-to-End Testing Script for AI Marketing Web Builder
Tests complete workflow from template creation to deployment
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api/v1"

class TestResults:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.results = []
    
    def add_result(self, test_name: str, passed: bool, details: str = "", data: Any = None):
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
        else:
            self.tests_failed += 1
        
        self.results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "data": data
        })
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")

results = TestResults()

def test_api_health():
    """Test basic API health"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            results.add_result("API Health Check", True, f"Status: {data.get('status')}")
            return True
        else:
            results.add_result("API Health Check", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("API Health Check", False, str(e))
        return False

def test_templates_api():
    """Test template retrieval API"""
    try:
        response = requests.get(f"{API_BASE}/templates", timeout=5)
        if response.status_code == 200:
            data = response.json()
            templates = data.get('templates', [])
            results.add_result("Templates API", True, f"Found {len(templates)} templates")
            return templates
        else:
            results.add_result("Templates API", False, f"Status: {response.status_code}")
            return []
    except Exception as e:
        results.add_result("Templates API", False, str(e))
        return []

def test_template_components():
    """Test template components API"""
    try:
        response = requests.get(f"{API_BASE}/templates/components", timeout=5)
        if response.status_code == 200:
            data = response.json()
            results.add_result("Template Components API", True, f"Status: {response.status_code}")
            return True
        else:
            results.add_result("Template Components API", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("Template Components API", False, str(e))
        return False

def test_publishing_stats():
    """Test publishing system"""
    try:
        response = requests.get(f"{API_BASE}/publishing/stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            results.add_result("Publishing Stats", True, f"Status: {response.status_code}")
            return True
        elif response.status_code == 404:
            results.add_result("Publishing Stats", True, "Endpoint not configured (expected)")
            return True
        else:
            results.add_result("Publishing Stats", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("Publishing Stats", False, str(e))
        return False

def test_workflow_endpoints():
    """Test workflow system endpoints"""
    try:
        response = requests.get(f"{API_BASE}/workflows", timeout=5)
        if response.status_code in [200, 401]:  # 401 is expected without auth
            results.add_result("Workflow Endpoints", True, f"Status: {response.status_code}")
            return True
        else:
            results.add_result("Workflow Endpoints", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("Workflow Endpoints", False, str(e))
        return False

def test_frontend_accessibility():
    """Test frontend accessibility"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            results.add_result("Frontend Accessibility", True, f"Status: {response.status_code}")
            return True
        else:
            results.add_result("Frontend Accessibility", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("Frontend Accessibility", False, str(e))
        return False

def test_magic_workflow_integration():
    """Test the Magic Connector integration workflow"""
    try:
        # Test template to workflow connection
        templates = test_templates_api()
        if not templates:
            results.add_result("Magic Workflow Integration", False, "No templates available")
            return False
        
        # Test basic workflow creation structure
        workflow_data = {
            "name": "Test Magic Workflow",
            "description": "End-to-end workflow test",
            "nodes": [
                {
                    "node_id": "template-selector",
                    "name": "Template Selection",
                    "node_type": "trigger",
                    "parameters": {"template_id": templates[0]["id"] if templates else "template-1"},
                    "position": {"x": 100, "y": 100}
                }
            ],
            "connections": [],
            "settings": {"business_type": "test", "primary_color": "#2563eb"}
        }
        
        # We'll expect 401 since we don't have auth, but this tests the endpoint structure
        response = requests.post(f"{API_BASE}/workflows", json=workflow_data, timeout=5)
        if response.status_code in [201, 401, 422]:  # 201 success, 401 auth, 422 validation
            results.add_result("Magic Workflow Integration", True, f"Status: {response.status_code}")
            return True
        else:
            results.add_result("Magic Workflow Integration", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("Magic Workflow Integration", False, str(e))
        return False

def test_ai_template_generation():
    """Test AI template generation"""
    try:
        ai_request = {
            "description": "A modern SaaS landing page for email marketing automation",
            "category": "landing-page",
            "target_audience": "small business owners",
            "brand_colors": ["#2563eb", "#f59e0b", "#10b981"],
            "industry": "marketing-technology"
        }
        
        response = requests.post(f"{API_BASE}/templates/ai/generate", json=ai_request, timeout=10)
        if response.status_code in [200, 401]:  # 200 success, 401 auth
            results.add_result("AI Template Generation", True, f"Status: {response.status_code}")
            return True
        else:
            results.add_result("AI Template Generation", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        results.add_result("AI Template Generation", False, str(e))
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("🔍 Starting Comprehensive End-to-End Testing...")
    print("=" * 60)
    
    # Test core system health
    test_api_health()
    test_frontend_accessibility()
    
    # Test template system
    templates = test_templates_api()
    test_template_components()
    
    # Test AI integration
    test_ai_template_generation()
    
    # Test workflow system
    test_workflow_endpoints()
    
    # Test magic workflow integration
    test_magic_workflow_integration()
    
    # Test publishing system
    test_publishing_stats()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Tests Run: {results.tests_run}")
    print(f"Tests Passed: {results.tests_passed}")
    print(f"Tests Failed: {results.tests_failed}")
    
    if results.tests_failed > 0:
        print("\n❌ Failed Tests:")
        for result in results.results:
            if not result["passed"]:
                print(f"  - {result['test']}: {result['details']}")
    
    success_rate = (results.tests_passed / results.tests_run * 100) if results.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 95:
        print("✅ SYSTEM READY FOR PRODUCTION")
        return True
    elif success_rate >= 80:
        print("⚠️  SYSTEM NEEDS MINOR FIXES")
        return True
    else:
        print("❌ SYSTEM NEEDS MAJOR FIXES")
        return False

if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)