#!/usr/bin/env python3
"""
Test server for Story 3.6 SLA Remediation endpoints
Simple FastAPI server to test the remediation functionality
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(
    title="SLA Remediation Test Server",
    description="Test server for Story 3.6 remediation endpoints",
    version="1.0.0"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for testing
mock_strategies = [
    {
        "strategy_id": "restart_service",
        "strategy_name": "Restart Service",
        "violation_type": "build_time",
        "automation_level": "fully_automated",
        "success_rate": 0.85,
        "avg_resolution_time": 120,
        "risk_level": "low"
    },
    {
        "strategy_id": "scale_resources",
        "strategy_name": "Scale Resources",
        "violation_type": "deployment_time", 
        "automation_level": "semi_automated",
        "success_rate": 0.92,
        "avg_resolution_time": 180,
        "risk_level": "medium"
    }
]

mock_executions = [
    {
        "execution_id": "exec_001",
        "violation_id": "viol_001",
        "strategy_id": "restart_service",
        "status": "executing",
        "start_time": "2025-08-13T19:45:00Z",
        "success": False,
        "actions_completed": ["stop_service"],
        "rollback_performed": False,
        "escalation_level": 1,
        "manual_override": False,
        "audit_log": [
            {
                "timestamp": "2025-08-13T19:45:00Z",
                "event": "remediation_started",
                "details": {"strategy": "restart_service"}
            }
        ]
    }
]

mock_escalations = [
    {
        "escalation_id": "esc_001",
        "violation_id": "viol_002",
        "escalation_level": 2,
        "trigger": "remediation_timeout",
        "status": "executing",
        "start_time": "2025-08-13T19:40:00Z",
        "notifications_sent": [
            {
                "target_id": "devops_team",
                "target_type": "slack",
                "address": "#alerts",
                "success": True,
                "timestamp": "2025-08-13T19:40:30Z"
            }
        ],
        "actions_completed": ["notify_team"],
        "escalation_reason": "Automated remediation failed",
        "business_impact_score": 0.7
    }
]

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "sla-remediation-test"}

# Remediation endpoints
@app.get("/api/v1/sla-remediation/strategies")
async def list_strategies():
    return mock_strategies

@app.get("/api/v1/sla-remediation/executions")
async def list_executions():
    return mock_executions

@app.get("/api/v1/sla-remediation/escalations")
async def list_escalations():
    return mock_escalations

@app.get("/api/v1/sla-remediation/active-summary")
async def active_summary():
    return {
        "timestamp": datetime.now().isoformat(),
        "active_remediations": len(mock_executions),
        "active_escalations": len(mock_escalations),
        "total_violations_today": 15,
        "success_rate_today": 85.5,
        "avg_resolution_time_today": 12.3,
        "critical_violations": 2,
        "remediations_by_status": {
            "executing": 1,
            "pending": 0,
            "success": 8,
            "failed": 2
        },
        "escalations_by_level": {
            "1": 5,
            "2": 1,
            "3": 0
        }
    }

@app.post("/api/v1/sla-remediation/executions/{execution_id}/manual-override")
async def manual_override(execution_id: str, override_data: dict):
    return {
        "success": True,
        "message": f"Manual override applied to {execution_id}",
        "action": override_data.get("action", "unknown")
    }

@app.post("/api/v1/sla-remediation/escalations/{escalation_id}/control") 
async def control_escalation(escalation_id: str, control_data: dict):
    return {
        "success": True,
        "message": f"Escalation control applied to {escalation_id}",
        "action": control_data.get("action", "unknown")
    }

@app.get("/api/v1/sla-remediation/executions/{execution_id}")
async def get_execution(execution_id: str):
    # Return first mock execution for any ID
    if mock_executions:
        execution = mock_executions[0].copy()
        execution["execution_id"] = execution_id
        return execution
    return {"error": "Execution not found"}

@app.get("/api/v1/sla-remediation/system-health")
async def system_health():
    return {
        "status": "healthy",
        "remediation_engine": "operational",
        "escalation_matrix": "operational", 
        "ml_analyzer": "operational",
        "external_integrations": "partial",
        "uptime_seconds": 3600,
        "last_health_check": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting SLA Remediation Test Server on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)