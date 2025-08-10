"""
WebSocket endpoints for real-time workflow debugging and monitoring.
Story 3.1: Visual Workflow Debugging UI Backend Support
"""

import json
import logging
import asyncio
from typing import Dict, Set, Optional, Any
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.workflow import WorkflowExecution, WorkflowExecutionStatus, Workflow
from app.models.user import User
from app.api.deps import get_current_user_from_token
from app.services.workflow_service import WorkflowService, WorkflowExecutionService

logger = logging.getLogger(__name__)
router = APIRouter()


class WorkflowConnectionManager:
    """Manages WebSocket connections for workflow debugging."""
    
    def __init__(self):
        # Map of workflow_id -> set of websockets
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Map of websocket -> workflow_id for cleanup
        self.websocket_workflows: Dict[WebSocket, int] = {}
        # Map of websocket -> user_id for authorization
        self.websocket_users: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, workflow_id: int, user_id: int):
        """Connect a WebSocket to a workflow's debugging channel."""
        await websocket.accept()
        
        if workflow_id not in self.active_connections:
            self.active_connections[workflow_id] = set()
        
        self.active_connections[workflow_id].add(websocket)
        self.websocket_workflows[websocket] = workflow_id
        self.websocket_users[websocket] = user_id
        
        logger.info(f"WebSocket connected to workflow {workflow_id} for user {user_id}")

    async def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket from workflow debugging."""
        if websocket in self.websocket_workflows:
            workflow_id = self.websocket_workflows[websocket]
            
            if workflow_id in self.active_connections:
                self.active_connections[workflow_id].discard(websocket)
                
                # Clean up empty workflow connections
                if not self.active_connections[workflow_id]:
                    del self.active_connections[workflow_id]
            
            del self.websocket_workflows[websocket]
            
        if websocket in self.websocket_users:
            del self.websocket_users[websocket]
        
        logger.info("WebSocket disconnected from workflow debugging")

    async def send_workflow_status(self, workflow_id: int, message: Dict[str, Any]):
        """Send status update to all connected clients for a workflow."""
        if workflow_id in self.active_connections:
            message["timestamp"] = datetime.utcnow().isoformat()
            message_str = json.dumps(message)
            
            # Send to all connected clients for this workflow
            disconnected_websockets = []
            for websocket in self.active_connections[workflow_id].copy():
                try:
                    await websocket.send_text(message_str)
                except Exception as e:
                    logger.error(f"Error sending message to WebSocket: {e}")
                    disconnected_websockets.append(websocket)
            
            # Clean up disconnected websockets
            for websocket in disconnected_websockets:
                await self.disconnect(websocket)

    async def send_execution_update(self, workflow_id: int, execution_id: int, 
                                  node_id: str, status: str, 
                                  execution_time_ms: Optional[int] = None,
                                  error_details: Optional[str] = None,
                                  next_nodes: Optional[list] = None):
        """Send execution status update to connected clients."""
        message = {
            "type": "execution_update",
            "workflow_id": workflow_id,
            "execution_id": execution_id,
            "node_id": node_id,
            "status": status,
            "execution_time_ms": execution_time_ms,
            "error_details": error_details,
            "next_nodes": next_nodes or []
        }
        
        await self.send_workflow_status(workflow_id, message)

    async def send_execution_started(self, workflow_id: int, execution_id: int, trigger_data: Dict[str, Any]):
        """Send execution started notification."""
        message = {
            "type": "execution_started",
            "workflow_id": workflow_id,
            "execution_id": execution_id,
            "trigger_data": trigger_data
        }
        
        await self.send_workflow_status(workflow_id, message)

    async def send_execution_completed(self, workflow_id: int, execution_id: int, 
                                     status: str, duration_ms: int, 
                                     success_count: int, total_nodes: int):
        """Send execution completed notification."""
        message = {
            "type": "execution_completed",
            "workflow_id": workflow_id,
            "execution_id": execution_id,
            "final_status": status,
            "duration_ms": duration_ms,
            "success_count": success_count,
            "total_nodes": total_nodes,
            "success_rate": (success_count / total_nodes * 100) if total_nodes > 0 else 0
        }
        
        await self.send_workflow_status(workflow_id, message)


# Global connection manager instance
connection_manager = WorkflowConnectionManager()


@router.websocket("/workflows/{workflow_id}/debug")
async def workflow_debug_websocket(
    websocket: WebSocket,
    workflow_id: int,
    token: str = Query(..., description="JWT authentication token")
):
    """
    WebSocket endpoint for real-time workflow debugging.
    
    Provides live updates on:
    - Workflow execution status
    - Node-by-node execution progress
    - Error details and debugging information
    - Performance metrics and timing data
    """
    db_gen = get_db()
    db = await anext(db_gen)
    
    try:
        # Authenticate user
        user = await get_current_user_from_token(token, db)
        if not user:
            await websocket.close(code=4001, reason="Invalid authentication token")
            return

        # Verify workflow access
        workflow_service = WorkflowService(db)
        workflow = await workflow_service.get_by_id(workflow_id)
        
        if not workflow:
            await websocket.close(code=4004, reason="Workflow not found")
            return
            
        if workflow.owner_id != user.id:
            await websocket.close(code=4003, reason="Not authorized to debug this workflow")
            return

        # Connect to workflow debugging
        await connection_manager.connect(websocket, workflow_id, user.id)
        
        # Send initial workflow state
        execution_service = WorkflowExecutionService(db)
        recent_executions = await execution_service.get_by_workflow(workflow_id, 0, 5)
        
        await websocket.send_text(json.dumps({
            "type": "connected",
            "workflow_id": workflow_id,
            "workflow_name": workflow.name,
            "workflow_status": workflow.status.value,
            "is_active": workflow.is_active,
            "recent_executions": [
                {
                    "execution_id": exec.id,
                    "status": exec.status.value,
                    "started_at": exec.started_at.isoformat() if exec.started_at else None,
                    "finished_at": exec.finished_at.isoformat() if exec.finished_at else None,
                    "execution_time": exec.execution_time
                }
                for exec in recent_executions
            ],
            "timestamp": datetime.utcnow().isoformat()
        }))

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for client messages (e.g., requests for execution details)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_client_message(websocket, workflow_id, user.id, message, db)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }))
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Internal server error"
                }))
                
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
        await websocket.close(code=4000, reason="Connection error")
    finally:
        await connection_manager.disconnect(websocket)
        await db.close()


async def handle_client_message(websocket: WebSocket, workflow_id: int, 
                               user_id: int, message: Dict[str, Any], db: AsyncSession):
    """Handle incoming messages from the WebSocket client."""
    message_type = message.get("type")
    
    if message_type == "get_execution_details":
        execution_id = message.get("execution_id")
        if execution_id:
            await send_execution_details(websocket, workflow_id, execution_id, db)
    
    elif message_type == "get_node_logs":
        execution_id = message.get("execution_id")
        node_id = message.get("node_id")
        if execution_id and node_id:
            await send_node_logs(websocket, workflow_id, execution_id, node_id, db)
    
    elif message_type == "subscribe_execution":
        execution_id = message.get("execution_id")
        if execution_id:
            # Client wants to subscribe to updates for a specific execution
            await websocket.send_text(json.dumps({
                "type": "subscribed",
                "execution_id": execution_id,
                "message": f"Subscribed to execution {execution_id} updates"
            }))
    
    else:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }))


async def send_execution_details(websocket: WebSocket, workflow_id: int, 
                               execution_id: int, db: AsyncSession):
    """Send detailed execution information to client."""
    execution_service = WorkflowExecutionService(db)
    execution = await execution_service.get_by_id(execution_id)
    
    if not execution or execution.workflow_id != workflow_id:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": "Execution not found or access denied"
        }))
        return
    
    response = {
        "type": "execution_details",
        "execution_id": execution_id,
        "workflow_id": workflow_id,
        "status": execution.status.value,
        "started_at": execution.started_at.isoformat() if execution.started_at else None,
        "finished_at": execution.finished_at.isoformat() if execution.finished_at else None,
        "execution_time": execution.execution_time,
        "trigger_data": execution.trigger_data,
        "execution_data": execution.execution_data,
        "error_message": execution.error_message,
        "node_executions": []  # This would be populated from node execution logs
    }
    
    await websocket.send_text(json.dumps(response))


async def send_node_logs(websocket: WebSocket, workflow_id: int, 
                        execution_id: int, node_id: str, db: AsyncSession):
    """Send node-specific execution logs to client."""
    # This would fetch node-specific logs from the database
    # For now, return placeholder data
    response = {
        "type": "node_logs",
        "execution_id": execution_id,
        "node_id": node_id,
        "logs": [
            {
                "timestamp": datetime.utcnow().isoformat(),
                "level": "INFO",
                "message": f"Node {node_id} execution started"
            }
        ],
        "metrics": {
            "execution_time_ms": 150,
            "memory_usage": "2.3MB",
            "cpu_usage": "5%"
        }
    }
    
    await websocket.send_text(json.dumps(response))


# Export the connection manager for use by workflow execution services
__all__ = ["connection_manager", "router"]