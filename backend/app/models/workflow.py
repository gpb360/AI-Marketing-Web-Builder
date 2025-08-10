"""
Workflow models for n8n-style automation engine.
"""

from typing import Optional, List, Dict, Any
from sqlalchemy import String, Text, Boolean, JSON, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from datetime import datetime

from app.models.base import Base, TimestampMixin, UUIDMixin


class WorkflowStatus(str, enum.Enum):
    """Workflow status enumeration."""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class WorkflowExecutionStatus(str, enum.Enum):
    """Workflow execution status."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NodeType(str, enum.Enum):
    """Workflow node types."""
    TRIGGER = "trigger"
    ACTION = "action"
    CONDITION = "condition"
    WEBHOOK = "webhook"
    EMAIL = "email"
    HTTP_REQUEST = "http_request"
    DATA_TRANSFORM = "data_transform"
    CRM_UPDATE = "crm_update"
    DELAY = "delay"


class WorkflowCategory(str, enum.Enum):
    """Workflow categories for Magic Connector and Business Customization."""
    MARKETING = "marketing"
    SUPPORT = "support"
    SALES = "sales"
    ECOMMERCE = "ecommerce"  # Added for Story #106
    AUTOMATION = "automation"
    ANALYTICS = "analytics"
    INTEGRATION = "integration"


class TriggerType(str, enum.Enum):
    """Workflow trigger types."""
    FORM_SUBMIT = "form-submit"
    BUTTON_CLICK = "button-click"
    PAGE_VIEW = "page-view"
    CHAT_MESSAGE = "chat-message"
    CONTACT_FORM = "contact-form"
    EMAIL_OPEN = "email-open"
    EMAIL_CLICK = "email-click"
    WEBHOOK = "webhook"
    SCHEDULE = "schedule"
    MANUAL = "manual"
    
    # Epic 2: Advanced automation triggers
    PR_CREATED = "pr-created"
    PR_MERGED = "pr-merged"
    PR_REVIEWED = "pr-reviewed"
    COMMIT_PUSHED = "commit-pushed"
    BUILD_FAILED = "build-failed"
    BUILD_SUCCESS = "build-success"
    TEST_FAILED = "test-failed"
    SLA_VIOLATION = "sla-violation"
    AGENT_IDLE = "agent-idle"
    DEPLOYMENT_START = "deployment-start"
    DEPLOYMENT_COMPLETE = "deployment-complete"


class Workflow(Base, TimestampMixin, UUIDMixin):
    """Workflow automation model."""

    __tablename__ = "workflows"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[WorkflowStatus] = mapped_column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT)

    # Magic Connector fields
    category: Mapped[WorkflowCategory] = mapped_column(Enum(WorkflowCategory), default=WorkflowCategory.AUTOMATION)
    trigger_type: Mapped[TriggerType] = mapped_column(Enum(TriggerType), default=TriggerType.MANUAL)
    template_id: Mapped[Optional[str]] = mapped_column(String(100))  # Reference to workflow template
    component_id: Mapped[Optional[str]] = mapped_column(String(100))  # Connected component ID

    # Workflow configuration
    nodes: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    connections: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    settings: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    # Execution settings
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    trigger_count: Mapped[int] = mapped_column(Integer, default=0)
    success_count: Mapped[int] = mapped_column(Integer, default=0)
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Epic 2: Advanced automation settings
    priority: Mapped[int] = mapped_column(Integer, default=1)  # 1-10 priority scale
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=3600)  # 1 hour default
    retry_count: Mapped[int] = mapped_column(Integer, default=3)
    sla_threshold_seconds: Mapped[Optional[int]] = mapped_column(Integer)  # SLA threshold
    assigned_agent: Mapped[Optional[str]] = mapped_column(String(100))  # Assigned agent
    agent_group: Mapped[Optional[str]] = mapped_column(String(100))  # Agent group
    
    # Epic 2: Performance tracking
    average_duration: Mapped[float] = mapped_column(default=0.0)  # Average execution time
    last_executed_at: Mapped[Optional[datetime]] = mapped_column()
    last_success_at: Mapped[Optional[datetime]] = mapped_column()
    last_failure_at: Mapped[Optional[datetime]] = mapped_column()

    # Workflow relationships
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner: Mapped["User"] = relationship("User", back_populates="workflows")
    executions: Mapped[List["WorkflowExecution"]] = relationship("WorkflowExecution", back_populates="workflow")

    @property
    def success_rate(self) -> float:
        """Calculate workflow success rate."""
        if self.trigger_count == 0:
            return 0.0
        return (self.success_count / self.trigger_count) * 100

    @property
    def error_rate(self) -> float:
        """Calculate workflow error rate."""
        if self.trigger_count == 0:
            return 0.0
        return (self.error_count / self.trigger_count) * 100

    def __repr__(self) -> str:
        return f"<Workflow(id={self.id}, name='{self.name}', status='{self.status}', category='{self.category}')>"


class WorkflowExecution(Base, TimestampMixin, UUIDMixin):
    """Workflow execution history and logs."""
    
    __tablename__ = "workflow_executions"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    status: Mapped[WorkflowExecutionStatus] = mapped_column(
        Enum(WorkflowExecutionStatus), 
        default=WorkflowExecutionStatus.PENDING
    )
    
    # Execution details
    trigger_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    execution_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    
    # Timing information
    started_at: Mapped[Optional[datetime]] = mapped_column()
    finished_at: Mapped[Optional[datetime]] = mapped_column()
    execution_time: Mapped[Optional[int]] = mapped_column(Integer)  # in milliseconds
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="executions")
    execution_steps: Mapped[List["WorkflowExecutionStep"]] = relationship("WorkflowExecutionStep", back_populates="execution")
    
    def __repr__(self) -> str:
        return f"<WorkflowExecution(id={self.id}, workflow_id={self.workflow_id}, status='{self.status}')>"


class WorkflowNode(Base, TimestampMixin, UUIDMixin):
    """Individual workflow node configuration."""
    
    __tablename__ = "workflow_nodes"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    node_id: Mapped[str] = mapped_column(String(100), nullable=False)  # UUID-like identifier
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    node_type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=False)
    
    # Node configuration
    parameters: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    position: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)  # x, y coordinates
    
    # Node relationships and connections
    inputs: Mapped[List[str]] = mapped_column(JSON, default=list)  # Connected input node IDs
    outputs: Mapped[List[str]] = mapped_column(JSON, default=list)  # Connected output node IDs
    
    def __repr__(self) -> str:
        return f"<WorkflowNode(id={self.id}, node_id='{self.node_id}', type='{self.node_type}')>"


# Epic 2: Additional automation models

class SLAConfiguration(Base, TimestampMixin, UUIDMixin):
    """Epic 2: SLA monitoring and escalation configuration."""
    
    __tablename__ = "sla_configurations"
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # SLA parameters
    metric_type: Mapped[str] = mapped_column(String(100), nullable=False)  # pr_review_time, build_time, etc.
    threshold_value: Mapped[float] = mapped_column(nullable=False)
    threshold_unit: Mapped[str] = mapped_column(String(50), nullable=False)  # seconds, minutes, hours
    
    # Escalation configuration
    escalation_levels: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    notification_channels: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Monitoring settings
    check_interval_minutes: Mapped[int] = mapped_column(Integer, default=5)
    grace_period_minutes: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Statistics
    violation_count: Mapped[int] = mapped_column(Integer, default=0)
    escalation_count: Mapped[int] = mapped_column(Integer, default=0)
    last_violation_at: Mapped[Optional[datetime]] = mapped_column()
    
    # Relationships
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    creator: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<SLAConfiguration(id={self.id}, name='{self.name}', metric='{self.metric_type}')>"


class AgentActivity(Base, TimestampMixin, UUIDMixin):
    """Epic 2: Agent activity tracking for coordination and SLA monitoring."""
    
    __tablename__ = "agent_activities"
    
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    agent_type: Mapped[str] = mapped_column(String(100), nullable=False)  # frontend, backend, ai, etc.
    
    # Activity details
    activity_type: Mapped[str] = mapped_column(String(100), nullable=False)  # task_start, task_complete, commit, pr_review
    activity_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Performance metrics
    duration_seconds: Mapped[Optional[float]] = mapped_column()
    status: Mapped[Optional[str]] = mapped_column(String(50))  # success, failure, timeout, cancelled
    
    # Context
    repository: Mapped[Optional[str]] = mapped_column(String(255))
    branch_name: Mapped[Optional[str]] = mapped_column(String(255))
    pr_number: Mapped[Optional[int]] = mapped_column(Integer)
    commit_sha: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Timing
    completed_at: Mapped[Optional[datetime]] = mapped_column()

    def __repr__(self) -> str:
        return f"<AgentActivity(id={self.id}, agent='{self.agent_name}', type='{self.activity_type}')>"


class WorkflowTemplate(Base, TimestampMixin, UUIDMixin):
    """Epic 2: Pre-built workflow templates for common automation patterns."""
    
    __tablename__ = "workflow_templates"
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), default="automation")  # sla_monitoring, pr_automation, etc.
    
    # Template configuration
    template_config: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    parameter_schema: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # Usage and rating
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    rating_average: Mapped[float] = mapped_column(default=0.0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Template metadata
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)  # Verified by Epic 2 team
    
    # Relationships
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    creator: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<WorkflowTemplate(id={self.id}, name='{self.name}', category='{self.category}')>"


# Story 3.1: Visual Workflow Debugging Models

class WorkflowExecutionStep(Base, TimestampMixin, UUIDMixin):
    """Individual step/node execution within a workflow execution."""
    
    __tablename__ = "workflow_execution_steps"
    
    execution_id: Mapped[int] = mapped_column(ForeignKey("workflow_executions.id"), nullable=False)
    node_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    node_name: Mapped[str] = mapped_column(String(200), nullable=False)
    node_type: Mapped[NodeType] = mapped_column(Enum(NodeType), nullable=False)
    
    # Step execution status
    status: Mapped[WorkflowExecutionStatus] = mapped_column(
        Enum(WorkflowExecutionStatus),
        default=WorkflowExecutionStatus.PENDING
    )
    
    # Timing information
    started_at: Mapped[Optional[datetime]] = mapped_column()
    finished_at: Mapped[Optional[datetime]] = mapped_column()
    execution_time_ms: Mapped[Optional[int]] = mapped_column(Integer)  # Execution time in milliseconds
    
    # Step details
    input_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    output_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    error_stack_trace: Mapped[Optional[str]] = mapped_column(Text)
    
    # Performance metrics
    memory_usage_mb: Mapped[Optional[float]] = mapped_column()  # Memory usage in MB
    cpu_usage_percent: Mapped[Optional[float]] = mapped_column()  # CPU usage percentage
    
    # Debug information
    debug_logs: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    execution: Mapped["WorkflowExecution"] = relationship("WorkflowExecution", back_populates="execution_steps")
    
    @property
    def is_completed(self) -> bool:
        """Check if step execution is completed (success or failed)."""
        return self.status in [WorkflowExecutionStatus.SUCCESS, WorkflowExecutionStatus.FAILED]
    
    @property
    def duration_ms(self) -> Optional[int]:
        """Calculate execution duration in milliseconds."""
        if self.started_at and self.finished_at:
            delta = self.finished_at - self.started_at
            return int(delta.total_seconds() * 1000)
        return None
    
    def __repr__(self) -> str:
        return f"<WorkflowExecutionStep(id={self.id}, node_id='{self.node_id}', status='{self.status}')>"


class WorkflowDebugSession(Base, TimestampMixin, UUIDMixin):
    """Debug session for tracking workflow debugging activities."""
    
    __tablename__ = "workflow_debug_sessions"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # Session details
    session_name: Mapped[Optional[str]] = mapped_column(String(200))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Debugging configuration
    debug_level: Mapped[str] = mapped_column(String(20), default="INFO")  # DEBUG, INFO, WARN, ERROR
    capture_logs: Mapped[bool] = mapped_column(Boolean, default=True)
    capture_metrics: Mapped[bool] = mapped_column(Boolean, default=True)
    capture_data_flow: Mapped[bool] = mapped_column(Boolean, default=False)  # Can be resource-intensive
    
    # Session statistics
    executions_monitored: Mapped[int] = mapped_column(Integer, default=0)
    errors_detected: Mapped[int] = mapped_column(Integer, default=0)
    performance_issues: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timing
    started_at: Mapped[Optional[datetime]] = mapped_column()
    ended_at: Mapped[Optional[datetime]] = mapped_column()
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow")
    user: Mapped["User"] = relationship("User")
    
    def __repr__(self) -> str:
        return f"<WorkflowDebugSession(id={self.id}, workflow_id={self.workflow_id}, active={self.is_active})>"


class WorkflowPerformanceMetric(Base, TimestampMixin, UUIDMixin):
    """Performance metrics for workflow executions and nodes."""
    
    __tablename__ = "workflow_performance_metrics"
    
    workflow_id: Mapped[int] = mapped_column(ForeignKey("workflows.id"), nullable=False)
    execution_id: Mapped[Optional[int]] = mapped_column(ForeignKey("workflow_executions.id"))
    node_id: Mapped[Optional[str]] = mapped_column(String(100))  # NULL for workflow-level metrics
    
    # Metric details
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    metric_value: Mapped[float] = mapped_column(nullable=False)
    metric_unit: Mapped[str] = mapped_column(String(20), nullable=False)  # ms, mb, percent, count
    
    # Metric metadata
    measurement_timestamp: Mapped[datetime] = mapped_column(nullable=False, index=True)
    measurement_context: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    
    # Thresholds and alerts
    threshold_value: Mapped[Optional[float]] = mapped_column()
    is_threshold_exceeded: Mapped[bool] = mapped_column(Boolean, default=False)
    alert_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow")
    execution: Mapped[Optional["WorkflowExecution"]] = relationship("WorkflowExecution")
    
    def __repr__(self) -> str:
        return f"<WorkflowPerformanceMetric(metric='{self.metric_name}', value={self.metric_value}, unit='{self.metric_unit}')>"