#!/usr/bin/env python3
"""
Test script for workflow API endpoints.
"""

import sys
import os
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.schemas.workflow import WorkflowCreate
    from app.models.workflow import WorkflowCategory, TriggerType, WorkflowStatus
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Import error: {e}")
    IMPORTS_AVAILABLE = False


def test_workflow_validation():
    """Test workflow validation logic without database."""
    print("Testing Workflow Validation...")

    if not IMPORTS_AVAILABLE:
        print("   ✗ Required imports not available")
        return False

    try:
        # Test valid workflow structure
        print("1. Testing valid workflow structure...")
        nodes = [
            {
                "node_id": "trigger-1",
                "name": "Form Trigger",
                "node_type": "trigger",
                "parameters": {"form_fields": ["name", "email"]},
                "position": {"x": 100, "y": 100}
            },
            {
                "node_id": "email-1",
                "name": "Welcome Email",
                "node_type": "email",
                "parameters": {
                    "template": "welcome",
                    "subject": "Welcome!"
                },
                "position": {"x": 300, "y": 100}
            }
        ]

        connections = [
            {"source": "trigger-1", "target": "email-1"}
        ]

        # Import validation function
        from app.services.workflow_service import WorkflowService

        # Create a mock service instance for validation testing
        class MockDB:
            pass

        service = WorkflowService(MockDB())
        service._validate_workflow_data(nodes, connections)
        print("   ✓ Valid workflow structure passed validation")

        # Test invalid workflow structure
        print("2. Testing invalid workflow structure...")
        invalid_nodes = [
            {"node_id": "node1"},  # Missing required fields
            {"node_id": "node1"}   # Duplicate ID
        ]

        try:
            service._validate_workflow_data(invalid_nodes, [])
            print("   ✗ Invalid workflow should have failed validation")
            return False
        except Exception:
            print("   ✓ Invalid workflow correctly failed validation")

        print("✓ Workflow validation tests completed successfully")
        return True

    except Exception as e:
        print(f"   ✗ Workflow validation test failed: {e}")
        return False


def test_workflow_schemas():
    """Test workflow schema validation."""
    print("Testing Workflow Schemas...")

    if not IMPORTS_AVAILABLE:
        print("   ✗ Required imports not available")
        return False

    try:
        # Test WorkflowCreate schema
        print("1. Testing WorkflowCreate schema...")
        workflow_create = WorkflowCreate(
            name="Test Workflow",
            description="Test description",
            category=WorkflowCategory.MARKETING,
            trigger_type=TriggerType.FORM_SUBMIT,
            nodes=[],
            connections=[],
            settings={}
        )
        print("   ✓ WorkflowCreate schema validation passed")

        # Test required fields
        print("2. Testing required field validation...")
        try:
            invalid_workflow = WorkflowCreate(name="")  # Empty name should fail
            print("   ✗ Empty name validation should have failed")
            return False
        except Exception:
            print("   ✓ Empty name validation correctly failed")

        print("✓ Schema tests completed successfully")
        return True

    except Exception as e:
        print(f"✗ Schema test failed: {e}")
        return False


def test_workflow_models():
    """Test workflow model enums and structure."""
    print("Testing Workflow Models...")

    if not IMPORTS_AVAILABLE:
        print("   ✗ Required imports not available")
        return False

    try:
        # Test enums
        print("1. Testing workflow enums...")

        # Test WorkflowCategory
        categories = list(WorkflowCategory)
        print(f"   - Available categories: {[c.value for c in categories]}")

        # Test TriggerType
        triggers = list(TriggerType)
        print(f"   - Available trigger types: {[t.value for t in triggers]}")

        # Test WorkflowStatus
        statuses = list(WorkflowStatus)
        print(f"   - Available statuses: {[s.value for s in statuses]}")

        print("   ✓ Enum definitions are valid")

        print("✓ Model tests completed successfully")
        return True

    except Exception as e:
        print(f"✗ Model test failed: {e}")
        return False


def test_celery_task_structure():
    """Test that Celery tasks are properly structured."""
    print("Testing Celery Task Structure...")

    try:
        # Test if task functions exist and are importable
        print("1. Testing task imports...")

        # Check if the tasks module exists
        import app.services.tasks as tasks_module

        # Check if our workflow tasks are defined
        if hasattr(tasks_module, 'execute_workflow_task'):
            print("   ✓ execute_workflow_task found")
        else:
            print("   ✗ execute_workflow_task not found")
            return False

        if hasattr(tasks_module, 'execute_workflow_node_task'):
            print("   ✓ execute_workflow_node_task found")
        else:
            print("   ✗ execute_workflow_node_task not found")
            return False

        print("   ✓ Workflow execution tasks imported successfully")

        print("✓ Celery task tests completed successfully")
        return True

    except Exception as e:
        print(f"✗ Celery task test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("WORKFLOW API INTEGRATION TESTS")
    print("=" * 60)

    tests = [
        ("Workflow Models", test_workflow_models),
        ("Workflow Schemas", test_workflow_schemas),
        ("Celery Tasks", test_celery_task_structure),
        ("Workflow Validation", test_workflow_validation),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 40)

        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"✗ {test_name} failed with exception: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = 0
    total = len(results)

    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Workflow API is ready for integration.")
        return True
    else:
        print("❌ Some tests failed. Please review the implementation.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
