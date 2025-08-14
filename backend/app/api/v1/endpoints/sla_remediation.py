"""
SLA Remediation API endpoints for automated violation response workflows.
Integrates with existing SLA monitoring to provide automated remediation capabilities.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging

from ....database import get_db
from ....services.sla_remediation_service import SLARemediationService
from ....services.escalation_matrix_service import EscalationMatrixService
from ....models.workflow import SLAViolation
from ....schemas.analytics import (
    RemediationExecution,
    RemediationExecutionCreate,
    RemediationExecutionUpdate,
    RemediationStrategy,
    RemediationStrategyCreate,
    EscalationExecution,
    ManualOverrideRequest,
    RootCauseAnalysisResponse,
    RemediationHistoryResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sla-remediation", tags=["SLA Remediation"])

@router.get("/strategies", response_model=List[RemediationStrategy])
async def list_remediation_strategies(
    violation_type: Optional[str] = None,
    automation_level: Optional[str] = None,
    min_success_rate: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """List available remediation strategies with filtering options."""
    try:
        service = SLARemediationService(db)
        strategies = await service.list_strategies(
            violation_type=violation_type,
            automation_level=automation_level,
            min_success_rate=min_success_rate
        )
        return strategies
    except Exception as e:
        logger.error(f"Failed to list remediation strategies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/strategies", response_model=RemediationStrategy)
async def create_remediation_strategy(
    strategy: RemediationStrategyCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new remediation strategy."""
    try:
        service = SLARemediationService(db)
        created_strategy = await service.create_strategy(strategy)
        return created_strategy
    except Exception as e:
        logger.error(f"Failed to create remediation strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executions", response_model=List[RemediationExecution])
async def list_remediation_executions(
    status: Optional[str] = None,
    violation_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """List remediation executions with filtering and pagination."""
    try:
        service = SLARemediationService(db)
        executions = await service.list_executions(
            status=status,
            violation_type=violation_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset
        )
        return executions
    except Exception as e:
        logger.error(f"Failed to list remediation executions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executions/{execution_id}", response_model=RemediationExecution)
async def get_remediation_execution(
    execution_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a specific remediation execution."""
    try:
        service = SLARemediationService(db)
        execution = await service.get_execution(execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="Remediation execution not found")
        return execution
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get remediation execution {execution_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/violations/{violation_id}/remediate")
async def trigger_remediation(
    violation_id: str,
    background_tasks: BackgroundTasks,
    strategy_id: Optional[str] = None,
    force_level: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Trigger automated remediation for a specific violation."""
    try:
        service = SLARemediationService(db)
        
        # Get the violation
        violation = await service.get_violation(violation_id)
        if not violation:
            raise HTTPException(status_code=404, detail="SLA violation not found")
        
        # Start remediation process in background
        background_tasks.add_task(
            service.analyze_violation_and_remediate,
            violation,
            manual_strategy_id=strategy_id,
            force_escalation_level=force_level
        )
        
        return {
            "message": "Remediation process initiated",
            "violation_id": violation_id,
            "status": "started"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to trigger remediation for violation {violation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/executions/{execution_id}/manual-override")
async def manual_override(
    execution_id: str,
    override_request: ManualOverrideRequest,
    db: AsyncSession = Depends(get_db)
):
    """Perform manual override of an active remediation execution."""
    try:
        service = SLARemediationService(db)
        result = await service.manual_override(
            execution_id=execution_id,
            action=override_request.action,
            reason=override_request.reason,
            user_id=override_request.user_id
        )
        return result
    except Exception as e:
        logger.error(f"Failed to perform manual override for execution {execution_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/executions/{execution_id}/rollback")
async def rollback_remediation(
    execution_id: str,
    reason: str,
    db: AsyncSession = Depends(get_db)
):
    """Rollback a completed or failed remediation execution."""
    try:
        service = SLARemediationService(db)
        result = await service.rollback_execution(execution_id, reason)
        return result
    except Exception as e:
        logger.error(f"Failed to rollback remediation execution {execution_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/violations/{violation_id}/root-cause-analysis", response_model=RootCauseAnalysisResponse)
async def get_root_cause_analysis(
    violation_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get ML-powered root cause analysis for a violation."""
    try:
        service = SLARemediationService(db)
        violation = await service.get_violation(violation_id)
        if not violation:
            raise HTTPException(status_code=404, detail="SLA violation not found")
        
        analysis = await service.analyze_root_cause(violation)
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to perform root cause analysis for violation {violation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=RemediationHistoryResponse)
async def get_remediation_history(
    days: int = Query(30, ge=1, le=365),
    violation_type: Optional[str] = None,
    strategy_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get historical remediation performance data and analytics."""
    try:
        service = SLARemediationService(db)
        history = await service.get_remediation_history(
            days=days,
            violation_type=violation_type,
            strategy_id=strategy_id
        )
        return history
    except Exception as e:
        logger.error(f"Failed to get remediation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-summary")
async def get_active_remediation_summary(
    db: AsyncSession = Depends(get_db)
):
    """Get summary of currently active remediations and system status."""
    try:
        service = SLARemediationService(db)
        escalation_service = EscalationMatrixService(db)
        
        # Get active remediation counts
        active_remediations = await service.get_active_executions()
        active_escalations = await escalation_service.get_active_escalations()
        
        # Get summary statistics
        today = datetime.utcnow().date()
        history = await service.get_remediation_history(days=1)
        
        summary = {
            "timestamp": datetime.utcnow().isoformat(),
            "active_remediations": len(active_remediations),
            "active_escalations": len(active_escalations),
            "total_violations_today": history.total_violations,
            "success_rate_today": history.success_rate,
            "avg_resolution_time_today": history.avg_resolution_time,
            "critical_violations": len([r for r in active_remediations if r.escalation_level >= 3]),
            "remediations_by_status": {},
            "escalations_by_level": {}
        }
        
        # Count by status
        for remediation in active_remediations:
            status = remediation.status
            summary["remediations_by_status"][status] = summary["remediations_by_status"].get(status, 0) + 1
        
        # Count escalations by level
        for escalation in active_escalations:
            level = escalation.escalation_level
            summary["escalations_by_level"][level] = summary["escalations_by_level"].get(level, 0) + 1
        
        return summary
        
    except Exception as e:
        logger.error(f"Failed to get active remediation summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/strategies/{strategy_id}/test")
async def test_remediation_strategy(
    strategy_id: str,
    test_data: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """Test a remediation strategy with simulated data."""
    try:
        service = SLARemediationService(db)
        result = await service.test_strategy(strategy_id, test_data)
        return result
    except Exception as e:
        logger.error(f"Failed to test remediation strategy {strategy_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/strategies/{strategy_id}/effectiveness")
async def get_strategy_effectiveness(
    strategy_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    """Get effectiveness metrics for a specific remediation strategy."""
    try:
        service = SLARemediationService(db)
        effectiveness = await service.get_strategy_effectiveness(strategy_id, days)
        return effectiveness
    except Exception as e:
        logger.error(f"Failed to get strategy effectiveness for {strategy_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Escalation Management Endpoints
@router.get("/escalations", response_model=List[EscalationExecution])
async def list_active_escalations(
    level: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List active escalation executions."""
    try:
        service = EscalationMatrixService(db)
        escalations = await service.list_escalations(level=level, status=status)
        return escalations
    except Exception as e:
        logger.error(f"Failed to list escalations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/escalations/{escalation_id}/control")
async def control_escalation(
    escalation_id: str,
    action: str,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Control an active escalation (stop, modify, escalate further)."""
    try:
        service = EscalationMatrixService(db)
        result = await service.control_escalation(
            escalation_id=escalation_id,
            action=action,
            reason=reason
        )
        return result
    except Exception as e:
        logger.error(f"Failed to control escalation {escalation_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/system-health")
async def get_system_health(
    db: AsyncSession = Depends(get_db)
):
    """Get overall remediation system health status."""
    try:
        service = SLARemediationService(db)
        health_data = await service.get_system_health()
        return health_data
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        raise HTTPException(status_code=500, detail=str(e))