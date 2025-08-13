"""
Workflow schemas for API request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

from app.models.workflow import WorkflowStatus, WorkflowExecutionStatus, NodeType, WorkflowCategory, TriggerType


class WorkflowBase(BaseModel):
    """Base workflow schema."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class WorkflowCreate(WorkflowBase):
    """Workflow creation schema."""
    category: WorkflowCategory = WorkflowCategory.AUTOMATION
    trigger_type: TriggerType = TriggerType.MANUAL
    template_id: Optional[str] = None
    component_id: Optional[str] = None
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    connections: List[Dict[str, Any]] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    """Workflow update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    category: Optional[WorkflowCategory] = None
    trigger_type: Optional[TriggerType] = None
    template_id: Optional[str] = None
    component_id: Optional[str] = None
    nodes: Optional[List[Dict[str, Any]]] = None
    connections: Optional[List[Dict[str, Any]]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class WorkflowInDB(WorkflowBase):
    """Workflow schema for database operations."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: WorkflowStatus
    category: WorkflowCategory
    trigger_type: TriggerType
    template_id: Optional[str]
    component_id: Optional[str]
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

    # Computed properties
    success_rate: Optional[float] = None
    error_rate: Optional[float] = None


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


class WorkflowTemplate(BaseModel):
    """Workflow template schema."""
    id: str
    name: str
    description: str
    category: WorkflowCategory
    trigger_type: TriggerType
    template: WorkflowCreate


class WorkflowExecutionDetail(WorkflowExecutionInDB):
    """Detailed workflow execution schema with workflow info."""
    workflow_name: Optional[str] = None
    workflow_category: Optional[WorkflowCategory] = None


class WorkflowAnalytics(BaseModel):
    """Workflow analytics schema."""
    execution_count: int
    success_rate: float
    avg_execution_time: float
    error_rate: float
    trend_data: List[Dict[str, Any]] = Field(default_factory=list)


# SLA Prediction Schemas for Story 3.4

class SLAPredictionFeatures(BaseModel):
    """ML model input features for SLA violation prediction."""
    workflow_id: int
    violation_type: str = Field(..., description="Type of SLA violation to predict")
    historical_performance: List[float] = Field(default_factory=list, description="Last 30 days performance data")
    current_load: float = Field(0.0, ge=0.0, le=1.0, description="Current system load (0-1)")
    time_of_day: int = Field(0, ge=0, le=23, description="Hour of day (0-23)")
    day_of_week: int = Field(0, ge=0, le=6, description="Day of week (0-6)")
    recent_violations: int = Field(0, ge=0, description="Number of recent violations")
    system_resources: Dict[str, float] = Field(default_factory=dict, description="System resource metrics")


class ActionRecommendation(BaseModel):
    """Recommended action for SLA violation prevention."""
    action: str = Field(..., description="Action identifier")
    description: str = Field(..., description="Human-readable action description")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in recommendation")
    estimated_impact: str = Field(..., description="Expected impact description")


class SLAPrediction(BaseModel):
    """SLA violation prediction result."""
    violation_type: str = Field(..., description="Type of predicted violation")
    probability: float = Field(..., ge=0.0, le=1.0, description="Violation probability (0.0-1.0)")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model confidence in prediction")
    predicted_time: str = Field(..., description="ISO timestamp of predicted violation")
    recommended_actions: List[ActionRecommendation] = Field(default_factory=list)
    historical_accuracy: float = Field(..., ge=0.0, le=1.0, description="Model accuracy for this violation type")


class PredictionRequest(BaseModel):
    """Request for SLA violation predictions."""
    workflow_id: int = Field(..., description="Workflow ID to predict for")
    violation_types: Optional[List[str]] = Field(None, description="Specific violation types to predict")
    forecast_window_minutes: int = Field(15, ge=5, le=60, description="Prediction time window")


class PredictionResponse(BaseModel):
    """Response containing SLA violation predictions."""
    workflow_id: int
    predictions: List[SLAPrediction]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    model_version: str = Field("1.0", description="ML model version used")


class ModelAccuracyReport(BaseModel):
    """ML model accuracy report."""
    violation_type_accuracies: Dict[str, float] = Field(default_factory=dict)
    overall_accuracy: float = Field(..., ge=0.0, le=1.0)
    total_predictions: int = Field(0, ge=0)
    correct_predictions: int = Field(0, ge=0)
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class PredictionFeedback(BaseModel):
    """Feedback for ML model improvement."""
    prediction_id: str = Field(..., description="Original prediction identifier")
    workflow_id: int
    violation_type: str
    predicted_violation: bool = Field(..., description="Whether violation was predicted")
    actual_violation: bool = Field(..., description="Whether violation actually occurred")
    feedback_timestamp: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(None, description="Additional feedback notes")