"""Add scenario modeling tables

Revision ID: add_scenario_modeling_tables
Revises: add_template_performance_analytics
Create Date: 2024-01-15 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_scenario_modeling_tables'
down_revision = 'add_template_performance_analytics'
branch_labels = None
depends_on = None


def upgrade():
    """Create scenario modeling tables."""
    
    # Create scenario modeling configurations table
    op.create_table(
        'scenario_modeling_configurations',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('template_id', sa.String(100), sa.ForeignKey('templates.id'), nullable=False),
        sa.Column('scenario_type', sa.Enum(
            'TRAFFIC_VOLUME',
            'AUDIENCE_SEGMENT', 
            'BUSINESS_GOAL',
            'INDUSTRY_CONTEXT',
            'SEASONAL_VARIATION',
            'COMPETITIVE_LANDSCAPE',
            'MARKETING_BUDGET',
            'TEMPLATE_VARIATION',
            name='scenario_type_enum'
        ), nullable=False),
        sa.Column('optimization_objective', sa.Enum(
            'CONVERSION_RATE',
            'REVENUE',
            'ENGAGEMENT',
            'LEAD_QUALITY',
            'COST_EFFICIENCY',
            'USER_RETENTION',
            'BRAND_AWARENESS',
            name='optimization_objective_enum'
        ), nullable=False),
        sa.Column('base_configuration', sa.JSON, default={}),
        sa.Column('variable_parameters', sa.JSON, default={}),
        sa.Column('constraint_parameters', sa.JSON, default={}),
        sa.Column('business_context', sa.JSON, default={}),
        sa.Column('target_audience', sa.JSON, default={}),
        sa.Column('industry_data', sa.JSON, default={})
    )
    
    # Create scenario models table
    op.create_table(
        'scenario_models',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('configuration_id', sa.String(100), sa.ForeignKey('scenario_modeling_configurations.id'), nullable=False),
        sa.Column('parameters', sa.JSON, default={}),
        sa.Column('template_modifications', sa.JSON, default={}),
        sa.Column('context_variables', sa.JSON, default={}),
        sa.Column('prediction_results', sa.JSON),
        sa.Column('confidence_score', sa.Float()),
        sa.Column('is_baseline', sa.Boolean, default=False),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('execution_priority', sa.Integer, default=0)
    )
    
    # Create scenario predictions table
    op.create_table(
        'scenario_predictions',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('scenario_id', sa.String(100), sa.ForeignKey('scenario_models.id'), nullable=False),
        sa.Column('prediction_type', sa.String(100), nullable=False),
        sa.Column('predicted_value', sa.Float, nullable=False),
        sa.Column('confidence_interval_lower', sa.Float, nullable=False),
        sa.Column('confidence_interval_upper', sa.Float, nullable=False),
        sa.Column('confidence_level', sa.Float, default=0.95),
        sa.Column('baseline_value', sa.Float),
        sa.Column('improvement_percentage', sa.Float),
        sa.Column('statistical_significance', sa.Float),
        sa.Column('prediction_horizon_days', sa.Integer, default=30),
        sa.Column('seasonal_adjustment', sa.Float),
        sa.Column('model_version', sa.String(50), default='v1.0'),
        sa.Column('feature_importance', sa.JSON)
    )
    
    # Create optimization recommendations table
    op.create_table(
        'optimization_recommendations',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('configuration_id', sa.String(100), sa.ForeignKey('scenario_modeling_configurations.id'), nullable=False),
        sa.Column('recommendation_type', sa.String(100), nullable=False),
        sa.Column('priority', sa.Integer, default=0),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('rationale', sa.Text, nullable=False),
        sa.Column('implementation_steps', sa.JSON, default=[]),
        sa.Column('estimated_effort_hours', sa.Float),
        sa.Column('required_resources', sa.JSON, default=[]),
        sa.Column('expected_impact', sa.JSON, default={}),
        sa.Column('risk_assessment', sa.JSON, default={}),
        sa.Column('success_probability', sa.Float, default=0.5),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('user_feedback', sa.JSON)
    )
    
    # Create scenario experiments table
    op.create_table(
        'scenario_experiments',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('scenario_id', sa.String(100), sa.ForeignKey('scenario_models.id'), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True)),
        sa.Column('end_date', sa.DateTime(timezone=True)),
        sa.Column('status', sa.String(50), default='planned'),
        sa.Column('hypothesis', sa.Text, nullable=False),
        sa.Column('success_metrics', sa.JSON, default=[]),
        sa.Column('sample_size', sa.Integer),
        sa.Column('actual_results', sa.JSON),
        sa.Column('prediction_accuracy', sa.Float),
        sa.Column('lessons_learned', sa.Text)
    )
    
    # Create indexes for performance
    op.create_index('idx_scenario_config_template_id', 'scenario_modeling_configurations', ['template_id'])
    op.create_index('idx_scenario_config_objective', 'scenario_modeling_configurations', ['optimization_objective'])
    op.create_index('idx_scenario_models_config_id', 'scenario_models', ['configuration_id'])
    op.create_index('idx_scenario_models_active', 'scenario_models', ['is_active'])
    op.create_index('idx_scenario_models_priority', 'scenario_models', ['execution_priority'])
    op.create_index('idx_scenario_predictions_scenario_id', 'scenario_predictions', ['scenario_id'])
    op.create_index('idx_scenario_predictions_type', 'scenario_predictions', ['prediction_type'])
    op.create_index('idx_optimization_recommendations_config_id', 'optimization_recommendations', ['configuration_id'])
    op.create_index('idx_optimization_recommendations_priority', 'optimization_recommendations', ['priority'])
    op.create_index('idx_scenario_experiments_scenario_id', 'scenario_experiments', ['scenario_id'])
    op.create_index('idx_scenario_experiments_status', 'scenario_experiments', ['status'])
    
    # Add relationship columns to templates table
    op.add_column('templates', sa.Column('scenario_configurations_count', sa.Integer, default=0))
    op.add_column('templates', sa.Column('optimization_score', sa.Float, default=0.0))
    
    # Create composite indexes for common queries
    op.create_index(
        'idx_scenario_models_config_active_priority', 
        'scenario_models', 
        ['configuration_id', 'is_active', 'execution_priority']
    )
    op.create_index(
        'idx_scenario_predictions_scenario_type_created', 
        'scenario_predictions', 
        ['scenario_id', 'prediction_type', 'created_at']
    )


def downgrade():
    """Drop scenario modeling tables."""
    
    # Drop indexes
    op.drop_index('idx_scenario_predictions_scenario_type_created')
    op.drop_index('idx_scenario_models_config_active_priority')
    op.drop_index('idx_scenario_experiments_status')
    op.drop_index('idx_scenario_experiments_scenario_id')
    op.drop_index('idx_optimization_recommendations_priority')
    op.drop_index('idx_optimization_recommendations_config_id')
    op.drop_index('idx_scenario_predictions_type')
    op.drop_index('idx_scenario_predictions_scenario_id')
    op.drop_index('idx_scenario_models_priority')
    op.drop_index('idx_scenario_models_active')
    op.drop_index('idx_scenario_models_config_id')
    op.drop_index('idx_scenario_config_objective')
    op.drop_index('idx_scenario_config_template_id')
    
    # Drop relationship columns from templates table
    op.drop_column('templates', 'optimization_score')
    op.drop_column('templates', 'scenario_configurations_count')
    
    # Drop tables in reverse order
    op.drop_table('scenario_experiments')
    op.drop_table('optimization_recommendations')
    op.drop_table('scenario_predictions')
    op.drop_table('scenario_models')
    op.drop_table('scenario_modeling_configurations')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS optimization_objective_enum')
    op.execute('DROP TYPE IF EXISTS scenario_type_enum')