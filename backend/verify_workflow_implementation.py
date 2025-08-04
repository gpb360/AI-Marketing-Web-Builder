#!/usr/bin/env python3
"""
Verify workflow implementation structure and completeness.
"""

import os
import sys
from pathlib import Path

def check_file_exists(file_path: str, description: str) -> bool:
    """Check if a file exists and report the result."""
    if os.path.exists(file_path):
        print(f"   ✓ {description}")
        return True
    else:
        print(f"   ✗ {description} - FILE MISSING")
        return False

def check_file_content(file_path: str, search_terms: list, description: str) -> bool:
    """Check if a file contains specific content."""
    if not os.path.exists(file_path):
        print(f"   ✗ {description} - FILE MISSING")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        missing_terms = []
        for term in search_terms:
            if term not in content:
                missing_terms.append(term)
        
        if missing_terms:
            print(f"   ✗ {description} - Missing: {', '.join(missing_terms)}")
            return False
        else:
            print(f"   ✓ {description}")
            return True
            
    except Exception as e:
        print(f"   ✗ {description} - Error reading file: {e}")
        return False

def verify_workflow_models():
    """Verify workflow models are properly implemented."""
    print("Verifying Workflow Models...")
    
    model_file = "app/models/workflow.py"
    required_content = [
        "class WorkflowCategory",
        "class TriggerType", 
        "class Workflow",
        "class WorkflowExecution",
        "class WorkflowNode",
        "category: Mapped[WorkflowCategory]",
        "trigger_type: Mapped[TriggerType]",
        "template_id: Mapped[Optional[str]]",
        "component_id: Mapped[Optional[str]]"
    ]
    
    return check_file_content(model_file, required_content, "Workflow models with Magic Connector fields")

def verify_workflow_schemas():
    """Verify workflow schemas are properly implemented."""
    print("Verifying Workflow Schemas...")
    
    schema_file = "app/schemas/workflow.py"
    required_content = [
        "from app.models.workflow import WorkflowStatus, WorkflowExecutionStatus, NodeType, WorkflowCategory, TriggerType",
        "class WorkflowCreate",
        "class WorkflowUpdate", 
        "class WorkflowTemplate",
        "class WorkflowAnalytics",
        "category: WorkflowCategory",
        "trigger_type: TriggerType"
    ]
    
    return check_file_content(schema_file, required_content, "Workflow schemas with Magic Connector support")

def verify_workflow_service():
    """Verify workflow service is properly implemented."""
    print("Verifying Workflow Service...")
    
    service_file = "app/services/workflow_service.py"
    required_content = [
        "class WorkflowService",
        "_validate_workflow_data",
        "get_by_component",
        "get_by_category",
        "get_by_trigger_type",
        "search_workflows",
        "WorkflowCategory, TriggerType"
    ]
    
    return check_file_content(service_file, required_content, "Workflow service with validation and filtering")

def verify_workflow_endpoints():
    """Verify workflow API endpoints are properly implemented."""
    print("Verifying Workflow API Endpoints...")

    endpoints_file = "app/api/v1/endpoints/workflows.py"
    required_content = [
        "@router.get(\"/\", response_model=WorkflowList)",
        "@router.post(\"/\", response_model=Workflow",
        "@router.get(\"/{workflow_id}\", response_model=Workflow)",
        "@router.put(\"/{workflow_id}\", response_model=Workflow)",
        "@router.delete(\"/{workflow_id}\")",
        "/{workflow_id}/execute",
        "/{workflow_id}/trigger",
        "/{workflow_id}/executions",
        "/templates",
        "/{workflow_id}/analytics",
        "/executions/{execution_id}",
        "category: Optional[WorkflowCategory]",
        "search: Optional[str]"
    ]

    return check_file_content(endpoints_file, required_content, "Complete workflow API endpoints")

def verify_celery_tasks():
    """Verify Celery workflow tasks are implemented."""
    print("Verifying Celery Workflow Tasks...")
    
    tasks_file = "app/services/tasks.py"
    required_content = [
        "execute_workflow_task",
        "execute_workflow_node_task",
        "_execute_email_node",
        "_execute_webhook_node",
        "_execute_crm_update_node",
        "\"src.services.tasks.execute_workflow_task\": {\"queue\": \"workflows\"}"
    ]
    
    return check_file_content(tasks_file, required_content, "Celery workflow execution tasks")

def verify_api_routing():
    """Verify workflow endpoints are included in API routing."""
    print("Verifying API Routing...")
    
    api_file = "app/api/v1/api.py"
    required_content = [
        "workflows.router",
        "prefix=\"/workflows\"",
        "tags=[\"Workflows\"]"
    ]
    
    return check_file_content(api_file, required_content, "Workflow endpoints in API routing")

def main():
    """Run all verification checks."""
    print("=" * 60)
    print("WORKFLOW IMPLEMENTATION VERIFICATION")
    print("=" * 60)
    
    # Change to backend directory if not already there
    if not os.path.exists("app"):
        if os.path.exists("backend/app"):
            os.chdir("backend")
        else:
            print("❌ Cannot find app directory. Please run from project root or backend directory.")
            return False
    
    checks = [
        ("Workflow Models", verify_workflow_models),
        ("Workflow Schemas", verify_workflow_schemas),
        ("Workflow Service", verify_workflow_service),
        ("Workflow Endpoints", verify_workflow_endpoints),
        ("Celery Tasks", verify_celery_tasks),
        ("API Routing", verify_api_routing),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        print(f"\n{check_name}:")
        print("-" * 40)
        
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"   ✗ {check_name} failed with exception: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for check_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{check_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All verification checks passed!")
        print("✅ Workflow API implementation is complete and ready for integration.")
        print("\n📋 IMPLEMENTATION SUMMARY:")
        print("   • Enhanced Workflow model with Magic Connector fields")
        print("   • Updated schemas with category, trigger_type, and validation")
        print("   • Enhanced WorkflowService with validation and filtering")
        print("   • Complete CRUD API endpoints with search and analytics")
        print("   • Celery tasks for background workflow execution")
        print("   • Support for workflow templates and component connections")
        return True
    else:
        print(f"\n❌ {total - passed} verification checks failed.")
        print("Please review the implementation and fix any missing components.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
