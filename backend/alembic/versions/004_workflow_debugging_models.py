"""Add workflow debugging models for Story 3.1

Revision ID: 004
Revises: 003
Create Date: 2024-01-10 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '004'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create base tables that other migrations depend on
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_verified', sa.Boolean(), default=False, nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    
    # Create workflows table
    op.create_table('workflows',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('config', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflows_user_id', 'workflows', ['user_id'])
    
    # Create workflow_executions table
    op.create_table('workflow_executions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('workflow_id', sa.String(36), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', name='workflowexecutionstatus'), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_workflow_executions_workflow_id', 'workflow_executions', ['workflow_id'])
    
    # Create workflow_execution_steps table
    op.create_table('workflow_execution_steps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('execution_id', sa.Integer(), nullable=False),
        sa.Column('node_id', sa.String(length=100), nullable=False),
        sa.Column('node_name', sa.String(length=200), nullable=False),
        sa.Column('node_type', sa.Enum('TRIGGER', 'ACTION', 'CONDITION', 'WEBHOOK', 'EMAIL', 'HTTP_REQUEST', 'DATA_TRANSFORM', 'CRM_UPDATE', 'DELAY', name='nodetype'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', name='workflowexecutionstatus'), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('input_data', sa.JSON(), nullable=False),
        sa.Column('output_data', sa.JSON(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_stack_trace', sa.Text(), nullable=True),
        sa.Column('memory_usage_mb', sa.Float(), nullable=True),
        sa.Column('cpu_usage_percent', sa.Float(), nullable=True),
        sa.Column('debug_logs', sa.JSON(), nullable=False),
        sa.Column('retry_count', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['execution_id'], ['workflow_executions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for workflow_execution_steps
    op.create_index(op.f('ix_workflow_execution_steps_node_id'), 'workflow_execution_steps', ['node_id'], unique=False)
    op.create_index(op.f('ix_workflow_execution_steps_execution_id'), 'workflow_execution_steps', ['execution_id'], unique=False)
    
    # Create workflow_debug_sessions table
    op.create_table('workflow_debug_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('workflow_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('session_name', sa.String(length=200), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('debug_level', sa.String(length=20), nullable=False),
        sa.Column('capture_logs', sa.Boolean(), nullable=False),
        sa.Column('capture_metrics', sa.Boolean(), nullable=False),
        sa.Column('capture_data_flow', sa.Boolean(), nullable=False),
        sa.Column('executions_monitored', sa.Integer(), nullable=False),
        sa.Column('errors_detected', sa.Integer(), nullable=False),
        sa.Column('performance_issues', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('ended_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create workflow_performance_metrics table
    op.create_table('workflow_performance_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('workflow_id', sa.Integer(), nullable=False),
        sa.Column('execution_id', sa.Integer(), nullable=True),
        sa.Column('node_id', sa.String(length=100), nullable=True),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(length=20), nullable=False),
        sa.Column('measurement_timestamp', sa.DateTime(), nullable=False),
        sa.Column('measurement_context', sa.JSON(), nullable=False),
        sa.Column('threshold_value', sa.Float(), nullable=True),
        sa.Column('is_threshold_exceeded', sa.Boolean(), nullable=False),
        sa.Column('alert_sent', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['execution_id'], ['workflow_executions.id'], ),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for workflow_performance_metrics
    op.create_index(op.f('ix_workflow_performance_metrics_metric_name'), 'workflow_performance_metrics', ['metric_name'], unique=False)
    op.create_index(op.f('ix_workflow_performance_metrics_measurement_timestamp'), 'workflow_performance_metrics', ['measurement_timestamp'], unique=False)
    
    # Update existing workflow_executions table to add execution_steps relationship
    # Note: The relationship will be handled by SQLAlchemy ORM, no schema changes needed
    
    # Set default values for existing records
    op.execute("UPDATE workflow_execution_steps SET input_data = '{}' WHERE input_data IS NULL")
    op.execute("UPDATE workflow_execution_steps SET output_data = '{}' WHERE output_data IS NULL")
    op.execute("UPDATE workflow_execution_steps SET debug_logs = '[]' WHERE debug_logs IS NULL")
    op.execute("UPDATE workflow_execution_steps SET retry_count = 0 WHERE retry_count IS NULL")
    
    op.execute("UPDATE workflow_debug_sessions SET debug_level = 'INFO' WHERE debug_level IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET capture_logs = true WHERE capture_logs IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET capture_metrics = true WHERE capture_metrics IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET capture_data_flow = false WHERE capture_data_flow IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET executions_monitored = 0 WHERE executions_monitored IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET errors_detected = 0 WHERE errors_detected IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET performance_issues = 0 WHERE performance_issues IS NULL")
    op.execute("UPDATE workflow_debug_sessions SET is_active = true WHERE is_active IS NULL")
    
    op.execute("UPDATE workflow_performance_metrics SET measurement_context = '{}' WHERE measurement_context IS NULL")
    op.execute("UPDATE workflow_performance_metrics SET is_threshold_exceeded = false WHERE is_threshold_exceeded IS NULL")
    op.execute("UPDATE workflow_performance_metrics SET alert_sent = false WHERE alert_sent IS NULL")


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('workflow_performance_metrics')
    op.drop_table('workflow_debug_sessions')
    op.drop_table('workflow_execution_steps')
    
    # Drop enum types if they were created
    sa.Enum(name='workflowexecutionstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='nodetype').drop(op.get_bind(), checkfirst=True)