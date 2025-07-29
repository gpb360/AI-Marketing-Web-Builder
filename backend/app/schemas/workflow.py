"""
Workflow schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

from app.models.workflow import WorkflowStatus, WorkflowExecutionStatus, NodeType


class WorkflowBase(BaseModel):
    """Base workflow schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    """Workflow creation schema."""
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    connections: List[Dict[str, Any]] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    """Workflow update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    connections: Optional[List[Dict[str, Any]]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class WorkflowInDB(WorkflowBase):
    """Workflow schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: WorkflowStatus
    nodes: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]
    settings: Dict[str, Any]
    is_active: bool
    trigger_count: int
    success_count: int
    error_count: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class Workflow(WorkflowInDB):
    """Workflow schema for API responses."""
    pass


class WorkflowList(BaseModel):
    """Workflow list response schema."""
    workflows: List[Workflow]
    total: int
    page: int
    size: int
    pages: int


class WorkflowExecutionBase(BaseModel):
    """Base workflow execution schema."""
    workflow_id: int
    trigger_data: Dict[str, Any] = Field(default_factory=dict)


class WorkflowExecutionCreate(WorkflowExecutionBase):
    """Workflow execution creation schema."""
    pass


class WorkflowExecutionInDB(WorkflowExecutionBase):
    """Workflow execution schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: WorkflowExecutionStatus
    execution_data: Dict[str, Any]
    error_message: Optional[str]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    execution_time: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime] = None


class WorkflowExecution(WorkflowExecutionInDB):
    """Workflow execution schema for API responses."""
    pass


class WorkflowNodeBase(BaseModel):
    """Base workflow node schema."""
    node_id: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=200)
    node_type: NodeType


class WorkflowNodeCreate(WorkflowNodeBase):
    """Workflow node creation schema."""
    workflow_id: int
    parameters: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, Any] = Field(default_factory=dict)
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)


class WorkflowNodeUpdate(BaseModel):
    """Workflow node update schema."""
    name: Optional[str] = None
    node_type: Optional[NodeType] = None
    parameters: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, Any]] = None
    inputs: Optional[List[str]] = None
    outputs: Optional[List[str]] = None


class WorkflowNodeInDB(WorkflowNodeBase):
    """Workflow node schema for database operations."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    workflow_id: int
    parameters: Dict[str, Any]
    position: Dict[str, Any]
    inputs: List[str]
    outputs: List[str]
    created_at: datetime
    updated_at: Optional[datetime] = None


class WorkflowNode(WorkflowNodeInDB):
    """Workflow node schema for API responses."""
    pass


class WorkflowTrigger(BaseModel):
    """Workflow trigger schema."""
    workflow_id: int
    trigger_data: Dict[str, Any] = Field(default_factory=dict)
    
    
class WorkflowStats(BaseModel):
    """Workflow statistics schema."""
    total_workflows: int
    active_workflows: int
    total_executions: int
    success_rate: float
    avg_execution_time: Optional[float]