"""Add performance analytics tables for Story 3.3

Revision ID: 005_analytics_performance_tables
Revises: 004_workflow_debugging_models
Create Date: 2024-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_analytics_performance_tables'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create analytics and performance tracking tables."""
    
    # For SQLite, we'll use string columns instead of enums
    
    # Create workflow_analytics_events table
    op.create_table(
        'workflow_analytics_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Core identifiers
        sa.Column('workflow_id', sa.String(255), sa.ForeignKey('workflows.id'), nullable=False, index=True),
        sa.Column('execution_id', sa.String(255), nullable=True, index=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False, index=True),
        
        # Event details
        sa.Column('event_type', sa.String(50), nullable=False, index=True),
        sa.Column('event_data', sa.JSON(), nullable=False),
        
        # Performance metrics
        sa.Column('execution_time_ms', sa.Integer, nullable=True),
        sa.Column('resource_usage', sa.JSON(), nullable=True),
        
        # Business metrics
        sa.Column('conversion_value', sa.DECIMAL(10, 2), nullable=True),
        sa.Column('revenue_impact', sa.DECIMAL(10, 2), nullable=True),
        
        # Context
        sa.Column('component_id', sa.String(255), nullable=True, index=True),
        sa.Column('source_ip', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text, nullable=True)
    )
    
    # Create indexes for time-series queries
    op.create_index(
        'idx_workflow_analytics_time_type',
        'workflow_analytics_events',
        ['created_at', 'event_type']
    )
    op.create_index(
        'idx_workflow_analytics_workflow_time',
        'workflow_analytics_events',
        ['workflow_id', 'created_at']
    )
    op.create_index(
        'idx_workflow_analytics_user_time',
        'workflow_analytics_events',
        ['user_id', 'created_at']
    )
    
    # Create workflow_analytics_metrics table (renamed to avoid conflict with debug metrics)
    op.create_table(
        'workflow_analytics_metrics',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Identifiers
        sa.Column('workflow_id', sa.String(255), sa.ForeignKey('workflows.id'), nullable=False, index=True, unique=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False, index=True),
        
        # Time range
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),
        
        # Execution metrics
        sa.Column('total_executions', sa.Integer, default=0, nullable=False),
        sa.Column('successful_executions', sa.Integer, default=0, nullable=False),
        sa.Column('failed_executions', sa.Integer, default=0, nullable=False),
        sa.Column('success_rate', sa.Float, default=0.0, nullable=False),
        
        # Performance metrics
        sa.Column('avg_execution_time_ms', sa.Float, default=0.0, nullable=False),
        sa.Column('median_execution_time_ms', sa.Float, default=0.0, nullable=False),
        sa.Column('p95_execution_time_ms', sa.Float, default=0.0, nullable=False),
        
        # Business metrics
        sa.Column('total_conversions', sa.Integer, default=0, nullable=False),
        sa.Column('conversion_rate', sa.Float, default=0.0, nullable=False),
        sa.Column('total_revenue', sa.DECIMAL(12, 2), default=0.0, nullable=False),
        sa.Column('avg_revenue_per_execution', sa.DECIMAL(10, 2), default=0.0, nullable=False),
        
        # Cost analysis
        sa.Column('total_execution_cost', sa.DECIMAL(10, 4), default=0.0, nullable=False),
        sa.Column('cost_per_execution', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        sa.Column('roi_percentage', sa.Float, default=0.0, nullable=False),
        
        # Engagement metrics
        sa.Column('unique_users_engaged', sa.Integer, default=0, nullable=False),
        sa.Column('total_interactions', sa.Integer, default=0, nullable=False),
        sa.Column('engagement_score', sa.Float, default=0.0, nullable=False)
    )
    
    # Create workflow_ab_tests table
    op.create_table(
        'workflow_ab_tests',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Test configuration
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        
        # Workflow variants
        sa.Column('control_workflow_id', sa.String(255), sa.ForeignKey('workflows.id'), nullable=False),
        sa.Column('variant_workflow_id', sa.String(255), sa.ForeignKey('workflows.id'), nullable=False),
        
        # Test parameters
        sa.Column('traffic_split_percentage', sa.Integer, default=50, nullable=False),
        sa.Column('confidence_threshold', sa.Float, default=0.95, nullable=False),
        sa.Column('min_sample_size', sa.Integer, default=100, nullable=False),
        
        # Test status
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        
        # Results
        sa.Column('control_conversions', sa.Integer, default=0, nullable=False),
        sa.Column('control_total', sa.Integer, default=0, nullable=False),
        sa.Column('variant_conversions', sa.Integer, default=0, nullable=False),
        sa.Column('variant_total', sa.Integer, default=0, nullable=False),
        
        # Statistical analysis
        sa.Column('statistical_significance', sa.Float, nullable=True),
        sa.Column('confidence_interval_lower', sa.Float, nullable=True),
        sa.Column('confidence_interval_upper', sa.Float, nullable=True),
        sa.Column('winner_workflow_id', sa.String(255), nullable=True)
    )
    
    # Create workflow_cost_analysis table
    op.create_table(
        'workflow_cost_analysis',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Identifiers
        sa.Column('workflow_id', sa.String(255), sa.ForeignKey('workflows.id'), nullable=False, index=True),
        sa.Column('execution_id', sa.String(255), nullable=True, index=True),
        
        # Resource costs
        sa.Column('compute_cost', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        sa.Column('storage_cost', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        sa.Column('network_cost', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        sa.Column('email_cost', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        sa.Column('external_api_cost', sa.DECIMAL(8, 4), default=0.0, nullable=False),
        
        # Time savings
        sa.Column('manual_time_saved_minutes', sa.Integer, nullable=True),
        sa.Column('automation_value', sa.DECIMAL(10, 2), nullable=True),
        
        # Resource usage details
        sa.Column('cpu_seconds', sa.Float, nullable=True),
        sa.Column('memory_mb_seconds', sa.Float, nullable=True),
        sa.Column('api_calls_count', sa.Integer, nullable=True),
        
        # Cost attribution
        sa.Column('cost_breakdown', sa.JSON(), nullable=False)
    )
    
    # Create analytics_reports table
    op.create_table(
        'analytics_reports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Report details
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False, index=True),
        
        # Report configuration
        sa.Column('report_type', sa.String(100), nullable=False),
        sa.Column('template_id', sa.String(255), nullable=True),
        sa.Column('filters', sa.JSON(), nullable=False),
        sa.Column('date_range', sa.JSON(), nullable=False),
        
        # Scheduling
        sa.Column('is_scheduled', sa.Boolean, default=False, nullable=False),
        sa.Column('schedule_cron', sa.String(100), nullable=True),
        sa.Column('last_generated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_generation_at', sa.DateTime(timezone=True), nullable=True),
        
        # Recipients
        sa.Column('email_recipients', sa.JSON(), nullable=False),
        
        # Report data cache
        sa.Column('cached_data', sa.JSON(), nullable=True),
        sa.Column('cache_expires_at', sa.DateTime(timezone=True), nullable=True)
    )
    
    # Create external_analytics_integrations table
    op.create_table(
        'external_analytics_integrations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        # Integration details
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('platform', sa.String(100), nullable=False),
        sa.Column('platform_account_id', sa.String(255), nullable=False),
        
        # Configuration
        sa.Column('config', sa.JSON(), nullable=False),
        sa.Column('credentials', sa.JSON(), nullable=False),
        
        # Status
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('last_sync_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sync_status', sa.String(100), nullable=True),
        
        # Data mapping
        sa.Column('field_mappings', sa.JSON(), nullable=False)
    )


def downgrade() -> None:
    """Drop analytics and performance tracking tables."""
    
    # Drop tables in reverse order
    op.drop_table('external_analytics_integrations')
    op.drop_table('analytics_reports')
    op.drop_table('workflow_cost_analysis')
    op.drop_table('workflow_ab_tests')
    op.drop_table('workflow_analytics_metrics')
    
    # Drop indexes
    op.drop_index('idx_workflow_analytics_user_time', 'workflow_analytics_events')
    op.drop_index('idx_workflow_analytics_workflow_time', 'workflow_analytics_events')
    op.drop_index('idx_workflow_analytics_time_type', 'workflow_analytics_events')
    
    op.drop_table('workflow_analytics_events')
    
    # No enum types to drop for SQLite