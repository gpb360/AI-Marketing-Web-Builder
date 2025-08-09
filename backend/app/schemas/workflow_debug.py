"""
Pydantic schemas for workflow debugging functionality.
Story 3.1: Visual Workflow Debugging UI Backend Support
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator


class DebugSessionConfig(BaseModel):
    """Configuration for starting a debug session."""
    
    session_name: Optional[str] = None
    debug_level: str = Field(default="INFO", regex="^(DEBUG|INFO|WARN|ERROR)$")
    capture_logs: bool = True
    capture_metrics: bool = True
    capture_data_flow: bool = False


class DebugSessionCreate(BaseModel):
    """Schema for creating a debug session."""
    
    workflow_id: int
    config: DebugSessionConfig


class DebugSessionResponse(BaseModel):
    """Response schema for debug session."""
    
    session_id: int
    workflow_id: int
    session_name: Optional[str]
    debug_level: str
    capture_logs: bool
    capture_metrics: bool
    capture_data_flow: bool
    is_active: bool
    started_at: Optional[datetime]
    executions_monitored: int = 0
    errors_detected: int = 0
    performance_issues: int = 0

    class Config:
        from_attributes = True


class ExecutionStepTimeline(BaseModel):
    """Individual execution step in timeline."""
    
    step_id: int
    node_id: str
    node_name: str
    node_type: str
    status: str
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    execution_time_ms: Optional[int]
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error_message: Optional[str]
    memory_usage_mb: Optional[float]
    cpu_usage_percent: Optional[float]
    retry_count: int = 0


class ExecutionTimelineResponse(BaseModel):
    """Response schema for execution timeline."""
    
    workflow_id: int
    execution_id: int
    timeline: List[ExecutionStepTimeline]
    total_steps: int
    
    @validator('timeline', pre=True)
    def parse_timeline(cls, v):
        """Parse timeline data into ExecutionStepTimeline objects."""
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return [ExecutionStepTimeline(**item) for item in v]
        return v


class NodePerformanceMetrics(BaseModel):
    """Performance metrics for a node."""
    
    execution_time_ms: Optional[int]
    memory_usage_mb: Optional[float]
    cpu_usage_percent: Optional[float]


class ErrorDetails(BaseModel):
    """Error details for node execution."""
    
    message: Optional[str]
    stack_trace: Optional[str]


class NodeExecutionLogsResponse(BaseModel):
    """Response schema for node execution logs."""
    
    workflow_id: int
    execution_id: int
    node_id: str
    node_name: str
    execution_logs: List[Dict[str, Any]] = []
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error_details: ErrorDetails
    performance: NodePerformanceMetrics
    retry_count: int = 0


class NodePerformanceStats(BaseModel):
    """Performance statistics for a node."""
    
    avg_execution_time_ms: float
    execution_count: int
    error_count: int
    success_rate: float


class OverallWorkflowMetrics(BaseModel):
    """Overall workflow performance metrics."""
    
    total_executions: int
    avg_execution_time_ms: int
    max_execution_time_ms: int
    min_execution_time_ms: int


class WorkflowPerformanceMetricsResponse(BaseModel):
    """Response schema for workflow performance metrics."""
    
    workflow_id: int
    timeframe_hours: int
    overall_metrics: OverallWorkflowMetrics
    node_performance: Dict[str, NodePerformanceStats]


class ExecutionExportData(BaseModel):
    """Execution data for export."""
    
    execution_id: int
    status: str
    started_at: Optional[str]
    finished_at: Optional[str]
    execution_time: Optional[int]
    trigger_data: Dict[str, Any] = {}
    error_message: Optional[str]
    steps: List[Dict[str, Any]] = []


class ExecutionExportResponse(BaseModel):
    """Response schema for execution export."""
    
    workflow_id: int
    export_timestamp: str
    format: str
    executions: List[ExecutionExportData]


class WebSocketMessage(BaseModel):
    """Base WebSocket message schema."""
    
    type: str
    timestamp: Optional[str]


class WorkflowStatusEvent(WebSocketMessage):
    """WebSocket event for workflow status updates."""
    
    workflow_id: int
    execution_id: int
    node_id: str
    status: str = Field(..., regex="^(pending|running|success|failed)$")
    execution_time_ms: Optional[int]
    error_details: Optional[str]
    next_nodes: List[str] = []


class ExecutionStartedEvent(WebSocketMessage):
    """WebSocket event for execution started."""
    
    type: str = "execution_started"
    workflow_id: int
    execution_id: int
    trigger_data: Dict[str, Any] = {}


class ExecutionCompletedEvent(WebSocketMessage):
    """WebSocket event for execution completed."""
    
    type: str = "execution_completed"
    workflow_id: int
    execution_id: int
    final_status: str
    duration_ms: int
    success_count: int
    total_nodes: int
    success_rate: float


class ExecutionUpdateEvent(WebSocketMessage):
    """WebSocket event for execution step updates."""
    
    type: str = "execution_update"
    workflow_id: int
    execution_id: int
    node_id: str
    status: str
    execution_time_ms: Optional[int]
    error_details: Optional[str]
    next_nodes: List[str] = []


class ConnectedEvent(WebSocketMessage):
    """WebSocket event for successful connection."""
    
    type: str = "connected"
    workflow_id: int
    workflow_name: str
    workflow_status: str
    is_active: bool
    recent_executions: List[Dict[str, Any]] = []


class ClientMessage(BaseModel):
    """Message from WebSocket client."""
    
    type: str
    execution_id: Optional[int]
    node_id: Optional[str]


class GetExecutionDetailsMessage(ClientMessage):
    """Request execution details message."""
    
    type: str = "get_execution_details"
    execution_id: int


class GetNodeLogsMessage(ClientMessage):
    """Request node logs message."""
    
    type: str = "get_node_logs"
    execution_id: int
    node_id: str


class SubscribeExecutionMessage(ClientMessage):
    """Subscribe to execution updates message."""
    
    type: str = "subscribe_execution"
    execution_id: int


class ExecutionRetryRequest(BaseModel):
    """Request to retry a failed execution."""
    
    execution_id: int
    debug_enabled: bool = True
    retry_failed_nodes_only: bool = False


class ExecutionRetryResponse(BaseModel):
    """Response for execution retry."""
    
    message: str
    original_execution_id: int
    new_execution_id: int
    retry_timestamp: str


class WorkflowDebugHealthResponse(BaseModel):
    """Response for workflow debug health status."""
    
    workflow_id: int
    workflow_name: str
    debugging_enabled: bool
    active_websocket_connections: int
    recent_executions: int
    avg_execution_time_ms: int
    health_status: str
    last_checked: str


# Real-time debugging event types
class DebugEventType:
    """Constants for debug event types."""
    
    EXECUTION_STARTED = "execution_started"
    EXECUTION_COMPLETED = "execution_completed"
    EXECUTION_UPDATE = "execution_update"
    NODE_STARTED = "node_started"
    NODE_COMPLETED = "node_completed"
    NODE_FAILED = "node_failed"
    PERFORMANCE_ALERT = "performance_alert"
    ERROR_DETECTED = "error_detected"
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"


# Export all schemas
__all__ = [
    "DebugSessionConfig",
    "DebugSessionCreate", 
    "DebugSessionResponse",
    "ExecutionStepTimeline",
    "ExecutionTimelineResponse",
    "NodeExecutionLogsResponse",
    "WorkflowPerformanceMetricsResponse",
    "ExecutionExportResponse",
    "WorkflowStatusEvent",
    "ExecutionStartedEvent",
    "ExecutionCompletedEvent",
    "ExecutionUpdateEvent",
    "ConnectedEvent",
    "ClientMessage",
    "GetExecutionDetailsMessage",
    "GetNodeLogsMessage", 
    "SubscribeExecutionMessage",
    "ExecutionRetryRequest",
    "ExecutionRetryResponse",
    "WorkflowDebugHealthResponse",
    "DebugEventType"
]