"""Epic 1: Business Context Integration Tables

Revision ID: 007_business_context_integration
Revises: 006_epic_4_ai_features_tables
Create Date: 2024-08-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import context

# revision identifiers, used by Alembic.
revision = '007_business_context_integration'
down_revision = '006_epic_4_ai_features_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add tables for business context integration with Epic 3-4 systems."""
    
    # Business Context Analysis table
    op.create_table('business_context_analysis',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('industry', sa.String(100), nullable=False),
        sa.Column('company_size', sa.String(50), nullable=False),
        sa.Column('target_audience', sa.String(50), nullable=False),
        sa.Column('primary_goals', sa.Text(), nullable=True),
        sa.Column('business_context_data', sa.Text(), nullable=False),
        sa.Column('analysis_result', sa.Text(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('analysis_type', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.Index('ix_business_context_analysis_user_id', 'user_id'),
        sa.Index('ix_business_context_analysis_industry', 'industry'),
        sa.Index('ix_business_context_analysis_created_at', 'created_at')
    )
    
    # Business Context Usage Analytics table (for Epic 3 integration)
    op.create_table('business_context_usage_analytics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('analysis_type', sa.String(50), nullable=False),
        sa.Column('industry', sa.String(100), nullable=False),
        sa.Column('company_size', sa.String(50), nullable=False),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('recommendations_generated', sa.Integer(), nullable=True),
        sa.Column('user_feedback_score', sa.Integer(), nullable=True),
        sa.Column('conversion_outcome', sa.Boolean(), nullable=True),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('request_metadata', sa.Text(), nullable=True),
        sa.Column('response_metadata', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.Index('ix_bc_usage_analytics_user_id', 'user_id'),
        sa.Index('ix_bc_usage_analytics_industry', 'industry'),
        sa.Index('ix_bc_usage_analytics_timestamp', 'timestamp'),
        sa.Index('ix_bc_usage_analytics_analysis_type', 'analysis_type')
    )
    
    # Template Context Scoring table (for Epic 1-4 integration)
    op.create_table('template_context_scoring',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('business_context_analysis_id', sa.String(), nullable=False),
        sa.Column('industry_alignment_score', sa.Float(), nullable=False),
        sa.Column('goal_compatibility_score', sa.Float(), nullable=False),
        sa.Column('feature_coverage_score', sa.Float(), nullable=False),
        sa.Column('complexity_match_score', sa.Float(), nullable=False),
        sa.Column('overall_suitability_score', sa.Float(), nullable=False),
        sa.Column('recommendation_level', sa.String(50), nullable=False),
        sa.Column('score_explanation', sa.Text(), nullable=True),
        sa.Column('potential_issues', sa.Text(), nullable=True),
        sa.Column('customization_suggestions', sa.Text(), nullable=True),
        sa.Column('ai_analysis_data', sa.Text(), nullable=True),
        sa.Column('user_selected', sa.Boolean(), nullable=True),
        sa.Column('actual_performance', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['business_context_analysis_id'], ['business_context_analysis.id'], ondelete='CASCADE'),
        sa.Index('ix_template_context_scoring_template_id', 'template_id'),
        sa.Index('ix_template_context_scoring_user_id', 'user_id'),
        sa.Index('ix_template_context_scoring_overall_score', 'overall_suitability_score')
    )
    
    # Business Success Patterns table (for Epic 1-3-4 learning)
    op.create_table('business_success_patterns',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('industry', sa.String(100), nullable=False),
        sa.Column('company_size', sa.String(50), nullable=False),
        sa.Column('business_model', sa.String(50), nullable=False),
        sa.Column('primary_goal', sa.String(50), nullable=False),
        sa.Column('template_features', sa.Text(), nullable=False),
        sa.Column('success_metrics', sa.Text(), nullable=False),
        sa.Column('conversion_rate', sa.Float(), nullable=True),
        sa.Column('engagement_rate', sa.Float(), nullable=True),
        sa.Column('bounce_rate', sa.Float(), nullable=True),
        sa.Column('time_on_page', sa.Float(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('sample_size', sa.Integer(), nullable=False),
        sa.Column('pattern_source', sa.String(50), nullable=False), # 'historical_data', 'ai_generated', 'industry_benchmark'
        sa.Column('validation_status', sa.String(20), nullable=False), # 'pending', 'validated', 'deprecated'
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_validated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_success_patterns_industry', 'industry'),
        sa.Index('ix_success_patterns_company_size', 'company_size'),
        sa.Index('ix_success_patterns_goal', 'primary_goal'),
        sa.Index('ix_success_patterns_confidence', 'confidence_score'),
        sa.Index('ix_success_patterns_validation', 'validation_status')
    )
    
    # Epic 1-3-4 Integration Metrics table
    op.create_table('epic_integration_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('integration_type', sa.String(50), nullable=False), # 'epic1_to_epic3', 'epic1_to_epic4', 'epic3_to_epic4'
        sa.Column('source_system', sa.String(20), nullable=False), # 'business_context', 'analytics', 'ai_features'
        sa.Column('target_system', sa.String(20), nullable=False),
        sa.Column('operation_type', sa.String(50), nullable=False), # 'recommendation', 'analysis', 'optimization'
        sa.Column('input_data', sa.Text(), nullable=True),
        sa.Column('output_data', sa.Text(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('accuracy_score', sa.Float(), nullable=True),
        sa.Column('user_satisfaction', sa.Integer(), nullable=True), # 1-5 rating
        sa.Column('business_impact', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.Index('ix_epic_integration_metrics_user_id', 'user_id'),
        sa.Index('ix_epic_integration_metrics_integration_type', 'integration_type'),
        sa.Index('ix_epic_integration_metrics_timestamp', 'timestamp'),
        sa.Index('ix_epic_integration_metrics_success', 'success')
    )
    
    # Add business context fields to existing users table (extend user profile)
    op.add_column('users', sa.Column('industry_preference', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('company_size_category', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('business_goals', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('target_audience_focus', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('technical_expertise_level', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('context_preferences', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('users', sa.Column('context_analysis_count', sa.Integer(), server_default=sa.text('0'), nullable=False))
    
    # Add indexes for new user fields
    op.create_index('ix_users_industry_preference', 'users', ['industry_preference'])
    op.create_index('ix_users_company_size_category', 'users', ['company_size_category'])


def downgrade() -> None:
    """Remove business context integration tables."""
    
    # Drop indexes first
    op.drop_index('ix_users_company_size_category', table_name='users')
    op.drop_index('ix_users_industry_preference', table_name='users')
    
    # Drop added columns from users table
    op.drop_column('users', 'context_analysis_count')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'context_preferences')
    op.drop_column('users', 'technical_expertise_level')
    op.drop_column('users', 'target_audience_focus')
    op.drop_column('users', 'business_goals')
    op.drop_column('users', 'company_size_category')
    op.drop_column('users', 'industry_preference')
    
    # Drop tables in reverse order
    op.drop_table('epic_integration_metrics')
    op.drop_table('business_success_patterns')
    op.drop_table('template_context_scoring')
    op.drop_table('business_context_usage_analytics')
    op.drop_table('business_context_analysis')