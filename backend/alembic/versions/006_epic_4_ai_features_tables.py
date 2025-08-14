"""Epic 4: AI Features Database Schema
Add tables for intelligent component suggestions, AI-powered template generation,
natural language workflow creation, and predictive template performance.

Revision ID: 006
Revises: 005
Create Date: 2024-01-15 10:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '006_epic_4_ai_features_tables'
down_revision: Union[str, None] = '005_analytics_performance_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create component_embeddings table for semantic search
    op.create_table(
        'component_embeddings',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('component_id', sa.String(36), nullable=False),
        sa.Column('embedding_vector', sa.JSON(), nullable=False),
        sa.Column('embedding_model', sa.String(100), nullable=False),
        sa.Column('semantic_tags', sa.JSON(), nullable=False, default='[]'),
        sa.Column('similarity_clusters', sa.JSON(), nullable=False, default='[]'),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['component_id'], ['template_components.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_component_embeddings_component_id', 'component_embeddings', ['component_id'])
    op.create_index('ix_component_embeddings_model', 'component_embeddings', ['embedding_model'])
    
    # Create component_suggestions table for AI suggestions tracking
    op.create_table(
        'component_suggestions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('context_hash', sa.String(64), nullable=False),
        sa.Column('suggested_component_id', sa.String(36), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('reasoning', sa.Text(), nullable=False),
        sa.Column('priority_level', sa.String(20), nullable=False),  # high, medium, low
        sa.Column('expected_impact', sa.Text(), nullable=True),
        sa.Column('customization_suggestions', sa.JSON(), nullable=False, default='[]'),
        sa.Column('was_accepted', sa.Boolean(), nullable=True),
        sa.Column('feedback_score', sa.Integer(), nullable=True),  # 1-5 rating
        sa.Column('feedback_comments', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['suggested_component_id'], ['template_components.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_component_suggestions_user_id', 'component_suggestions', ['user_id'])
    op.create_index('ix_component_suggestions_context_hash', 'component_suggestions', ['context_hash'])
    op.create_index('ix_component_suggestions_accepted', 'component_suggestions', ['was_accepted'])
    
    # Create ai_generated_templates table
    op.create_table(
        'ai_generated_templates',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('generation_request', sa.JSON(), nullable=False),  # Original request data
        sa.Column('business_context', sa.JSON(), nullable=False),
        sa.Column('ai_model_used', sa.String(50), nullable=False),
        sa.Column('generation_time_seconds', sa.Float(), nullable=False),
        sa.Column('template_data', sa.JSON(), nullable=False),  # Generated template
        sa.Column('performance_prediction', sa.JSON(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('optimization_suggestions', sa.JSON(), nullable=False, default='[]'),
        sa.Column('user_rating', sa.Integer(), nullable=True),  # 1-5 rating
        sa.Column('was_used', sa.Boolean(), nullable=False, default=False),
        sa.Column('template_id', sa.String(36), nullable=True),  # If converted to actual template
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_generated_templates_user_id', 'ai_generated_templates', ['user_id'])
    op.create_index('ix_ai_generated_templates_model', 'ai_generated_templates', ['ai_model_used'])
    op.create_index('ix_ai_generated_templates_rating', 'ai_generated_templates', ['user_rating'])
    
    # Create nl_workflow_creations table for natural language workflow tracking
    op.create_table(
        'nl_workflow_creations',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('user_input', sa.Text(), nullable=False),  # Original natural language input
        sa.Column('processed_input', sa.JSON(), nullable=False),  # Processed/cleaned input
        sa.Column('intent_classification', sa.JSON(), nullable=False),  # Classified intent
        sa.Column('extracted_entities', sa.JSON(), nullable=False),  # Extracted entities
        sa.Column('context_data', sa.JSON(), nullable=False),
        sa.Column('ai_model_used', sa.String(50), nullable=False),
        sa.Column('processing_time_seconds', sa.Float(), nullable=False),
        sa.Column('generated_workflow', sa.JSON(), nullable=False),  # Generated workflow config
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('validation_result', sa.JSON(), nullable=True),  # Workflow validation results
        sa.Column('explanation', sa.Text(), nullable=True),  # Human-readable explanation
        sa.Column('suggested_improvements', sa.JSON(), nullable=False, default='[]'),
        sa.Column('was_created', sa.Boolean(), nullable=False, default=False),
        sa.Column('workflow_id', sa.String(36), nullable=True),  # If converted to actual workflow
        sa.Column('user_feedback', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_nl_workflow_creations_user_id', 'nl_workflow_creations', ['user_id'])
    op.create_index('ix_nl_workflow_creations_model', 'nl_workflow_creations', ['ai_model_used'])
    op.create_index('ix_nl_workflow_creations_created', 'nl_workflow_creations', ['was_created'])
    
    # Create template_performance_predictions table
    op.create_table(
        'template_performance_predictions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('template_id', sa.String(36), nullable=True),  # Nullable for AI-generated templates
        sa.Column('ai_generated_template_id', sa.String(36), nullable=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('template_data', sa.JSON(), nullable=False),  # Template data analyzed
        sa.Column('industry_context', sa.JSON(), nullable=True),
        sa.Column('ai_model_used', sa.String(50), nullable=False),
        sa.Column('analysis_time_seconds', sa.Float(), nullable=False),
        
        # Prediction results
        sa.Column('predicted_conversion_rate', sa.Float(), nullable=True),
        sa.Column('predicted_bounce_rate', sa.Float(), nullable=True),
        sa.Column('predicted_time_on_page', sa.Float(), nullable=True),
        sa.Column('mobile_performance_score', sa.Integer(), nullable=True),
        sa.Column('seo_potential_score', sa.Integer(), nullable=True),
        sa.Column('accessibility_score', sa.Integer(), nullable=True),
        
        sa.Column('conversion_factors', sa.JSON(), nullable=False, default='[]'),
        sa.Column('conversion_barriers', sa.JSON(), nullable=False, default='[]'),
        sa.Column('improvement_recommendations', sa.JSON(), nullable=False, default='[]'),
        sa.Column('industry_comparison', sa.JSON(), nullable=True),
        sa.Column('confidence_assessment', sa.JSON(), nullable=False),
        
        # Actual performance tracking (for validation)
        sa.Column('actual_conversion_rate', sa.Float(), nullable=True),
        sa.Column('actual_bounce_rate', sa.Float(), nullable=True),
        sa.Column('actual_time_on_page', sa.Float(), nullable=True),
        sa.Column('prediction_accuracy_score', sa.Float(), nullable=True),  # How accurate was prediction
        
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ),
        sa.ForeignKeyConstraint(['ai_generated_template_id'], ['ai_generated_templates.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_template_performance_predictions_template_id', 'template_performance_predictions', ['template_id'])
    op.create_index('ix_template_performance_predictions_ai_template_id', 'template_performance_predictions', ['ai_generated_template_id'])
    op.create_index('ix_template_performance_predictions_user_id', 'template_performance_predictions', ['user_id'])
    
    # Create ai_feature_usage_analytics table for tracking AI feature adoption
    op.create_table(
        'ai_feature_usage_analytics',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('feature_type', sa.String(50), nullable=False),  # component_suggestions, template_generation, etc.
        sa.Column('session_id', sa.String(36), nullable=True),
        sa.Column('request_data', sa.JSON(), nullable=False),
        sa.Column('response_data', sa.JSON(), nullable=False),
        sa.Column('ai_model_used', sa.String(50), nullable=False),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('user_action', sa.String(50), nullable=True),  # accepted, rejected, modified, ignored
        sa.Column('satisfaction_score', sa.Integer(), nullable=True),  # 1-5 rating
        sa.Column('cost_estimate', sa.Float(), nullable=True),  # Estimated API cost
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_feature_usage_analytics_user_id', 'ai_feature_usage_analytics', ['user_id'])
    op.create_index('ix_ai_feature_usage_analytics_feature_type', 'ai_feature_usage_analytics', ['feature_type'])
    op.create_index('ix_ai_feature_usage_analytics_created_at', 'ai_feature_usage_analytics', ['created_at'])
    
    # Create ai_model_performance_metrics table for model performance tracking
    op.create_table(
        'ai_model_performance_metrics',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('model_name', sa.String(50), nullable=False),
        sa.Column('feature_type', sa.String(50), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('total_requests', sa.Integer(), nullable=False, default=0),
        sa.Column('successful_requests', sa.Integer(), nullable=False, default=0),
        sa.Column('failed_requests', sa.Integer(), nullable=False, default=0),
        sa.Column('average_latency_ms', sa.Float(), nullable=False, default=0.0),
        sa.Column('p95_latency_ms', sa.Float(), nullable=False, default=0.0),
        sa.Column('average_confidence_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('user_satisfaction_avg', sa.Float(), nullable=False, default=0.0),
        sa.Column('total_cost_estimate', sa.Float(), nullable=False, default=0.0),
        sa.Column('error_rate', sa.Float(), nullable=False, default=0.0),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('model_name', 'feature_type', 'date', name='uix_model_feature_date')
    )
    op.create_index('ix_ai_model_performance_metrics_model_name', 'ai_model_performance_metrics', ['model_name'])
    op.create_index('ix_ai_model_performance_metrics_feature_type', 'ai_model_performance_metrics', ['feature_type'])
    op.create_index('ix_ai_model_performance_metrics_date', 'ai_model_performance_metrics', ['date'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('ai_model_performance_metrics')
    op.drop_table('ai_feature_usage_analytics')
    op.drop_table('template_performance_predictions')
    op.drop_table('nl_workflow_creations')
    op.drop_table('ai_generated_templates')
    op.drop_table('component_suggestions')
    op.drop_table('component_embeddings')