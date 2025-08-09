"""
REST API endpoints for workflow debugging functionality.
Story 3.1: Visual Workflow Debugging UI Backend Support
"""

import json
from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import io
import csv

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.workflow import WorkflowStatus
from app.schemas.workflow_debug import (
    DebugSessionCreate, DebugSessionResponse, ExecutionTimelineResponse,
    NodeExecutionLogsResponse, WorkflowPerformanceMetricsResponse,
    ExecutionExportResponse, DebugSessionConfig
)
from app.services.workflow_debug_service import WorkflowDebugService, WorkflowExecutionDebugService
from app.services.workflow_service import WorkflowService

router = APIRouter()


@router.post("/{workflow_id}/debug/start", response_model=DebugSessionResponse)
async def start_debug_session(
    workflow_id: int,
    config: DebugSessionConfig,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Start a new debugging session for a workflow."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to debug this workflow"
        )
    
    debug_service = WorkflowDebugService(db)
    session = await debug_service.start_debug_session(
        workflow_id=workflow_id,
        user_id=current_user.id,
        session_name=config.session_name,
        debug_config={
            'debug_level': config.debug_level,
            'capture_logs': config.capture_logs,
            'capture_metrics': config.capture_metrics,
            'capture_data_flow': config.capture_data_flow
        }
    )
    
    return DebugSessionResponse(
        session_id=session.id,
        workflow_id=workflow_id,
        session_name=session.session_name,
        debug_level=session.debug_level,
        capture_logs=session.capture_logs,
        capture_metrics=session.capture_metrics,
        capture_data_flow=session.capture_data_flow,
        is_active=session.is_active,
        started_at=session.started_at,
        executions_monitored=session.executions_monitored,
        errors_detected=session.errors_detected
    )


@router.post("/{workflow_id}/debug/stop")
async def stop_debug_session(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Stop the active debugging session for a workflow."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to debug this workflow"
        )
    
    debug_service = WorkflowDebugService(db)
    success = await debug_service.end_debug_session(workflow_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active debug session found"
        )
    
    return {"message": "Debug session stopped successfully"}


@router.get("/{workflow_id}/executions/{execution_id}/timeline", 
           response_model=ExecutionTimelineResponse)
async def get_execution_timeline(
    workflow_id: int,
    execution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get detailed execution timeline for debugging."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    debug_service = WorkflowDebugService(db)
    timeline = await debug_service.get_execution_timeline(execution_id)
    
    return ExecutionTimelineResponse(
        workflow_id=workflow_id,
        execution_id=execution_id,
        timeline=timeline,
        total_steps=len(timeline)
    )


@router.get("/{workflow_id}/executions/{execution_id}/nodes/{node_id}/logs",
           response_model=NodeExecutionLogsResponse)
async def get_node_execution_logs(
    workflow_id: int,
    execution_id: int,
    node_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get detailed logs for a specific node execution."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    debug_service = WorkflowDebugService(db)
    logs = await debug_service.get_node_execution_logs(execution_id, node_id)
    
    if not logs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node execution logs not found"
        )
    
    return NodeExecutionLogsResponse(
        workflow_id=workflow_id,
        execution_id=execution_id,
        node_id=node_id,
        node_name=logs['node_name'],
        execution_logs=logs['execution_logs'],
        input_data=logs['input_data'],
        output_data=logs['output_data'],
        error_details=logs['error_details'],
        performance=logs['performance'],
        retry_count=logs['retry_count']
    )


@router.get("/{workflow_id}/performance", response_model=WorkflowPerformanceMetricsResponse)
async def get_workflow_performance_metrics(
    workflow_id: int,
    timeframe_hours: int = Query(24, ge=1, le=168),  # 1 hour to 1 week
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get performance metrics for a workflow."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    debug_service = WorkflowDebugService(db)
    metrics = await debug_service.get_workflow_performance_metrics(
        workflow_id, timeframe_hours
    )
    
    return WorkflowPerformanceMetricsResponse(**metrics)


@router.get("/{workflow_id}/export/logs")
async def export_execution_logs(
    workflow_id: int,
    format_type: str = Query("json", regex="^(json|csv)$"),
    execution_ids: Optional[str] = Query(None, description="Comma-separated execution IDs"),
    timeframe_hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Export execution logs and performance data."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    # Parse execution IDs if provided
    execution_id_list = None
    if execution_ids:
        try:
            execution_id_list = [int(x.strip()) for x in execution_ids.split(',')]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid execution IDs format"
            )
    
    debug_service = WorkflowDebugService(db)
    export_data = await debug_service.export_execution_logs(
        workflow_id, format_type, execution_id_list
    )
    
    # Generate filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"workflow_{workflow_id}_logs_{timestamp}.{format_type}"
    
    if format_type == "json":
        content = json.dumps(export_data, indent=2)
        media_type = "application/json"
    else:  # CSV format
        content = _convert_to_csv(export_data)
        media_type = "text/csv"
    
    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/{workflow_id}/executions/{execution_id}/retry")
async def retry_failed_execution(
    workflow_id: int,
    execution_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retry a failed workflow execution with debugging enabled."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to execute this workflow"
        )
    
    # Get original execution
    debug_service = WorkflowExecutionDebugService(db)
    original_execution = await debug_service.get_execution_with_steps(execution_id)
    
    if not original_execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original execution not found"
        )
    
    # Create new execution with debug enabled
    new_execution = await debug_service.create_execution_with_debug(
        workflow_id,
        original_execution.trigger_data,
        debug_enabled=True
    )
    
    # TODO: Trigger actual workflow execution here
    # For now, return the new execution details
    
    return {
        "message": "Execution retry initiated with debugging enabled",
        "original_execution_id": execution_id,
        "new_execution_id": new_execution.id,
        "retry_timestamp": new_execution.started_at.isoformat()
    }


def _convert_to_csv(export_data: Dict[str, Any]) -> str:
    """Convert export data to CSV format."""
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Execution ID', 'Status', 'Started At', 'Finished At', 'Duration (ms)',
        'Node ID', 'Node Name', 'Node Type', 'Node Status', 'Node Duration (ms)',
        'Error Message', 'Memory Usage (MB)', 'CPU Usage (%)'
    ])
    
    # Write data rows
    for execution in export_data['executions']:
        base_row = [
            execution['execution_id'],
            execution['status'],
            execution['started_at'],
            execution['finished_at'],
            execution['execution_time']
        ]
        
        if execution['steps']:
            for step in execution['steps']:
                row = base_row + [
                    step['node_id'],
                    step['node_name'],
                    step['node_type'],
                    step['status'],
                    step['execution_time_ms'],
                    step['error_message'] or '',
                    step['performance_metrics']['memory_usage_mb'] or '',
                    step['performance_metrics']['cpu_usage_percent'] or ''
                ]
                writer.writerow(row)
        else:
            # Write execution without steps
            row = base_row + ['', '', '', '', '', '', '', '']
            writer.writerow(row)
    
    return output.getvalue()


@router.get("/{workflow_id}/debug/health")
async def get_debug_health_status(
    workflow_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Get debugging health status for a workflow."""
    
    # Verify workflow access
    workflow_service = WorkflowService(db)
    workflow = await workflow_service.get_by_id(workflow_id)
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if workflow.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this workflow"
        )
    
    # Check WebSocket connections
    from app.api.v1.endpoints.workflow_websocket import connection_manager
    active_connections = len(connection_manager.active_connections.get(workflow_id, set()))
    
    # Get recent execution statistics
    debug_service = WorkflowDebugService(db)
    metrics = await debug_service.get_workflow_performance_metrics(workflow_id, 1)  # Last hour
    
    return {
        "workflow_id": workflow_id,
        "workflow_name": workflow.name,
        "debugging_enabled": True,
        "active_websocket_connections": active_connections,
        "recent_executions": metrics['overall_metrics']['total_executions'],
        "avg_execution_time_ms": metrics['overall_metrics']['avg_execution_time_ms'],
        "health_status": "healthy",
        "last_checked": datetime.utcnow().isoformat()
    }