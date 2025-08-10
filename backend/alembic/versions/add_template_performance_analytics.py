"""Add template performance analytics tables

Revision ID: 004_template_analytics
Revises: 003_previous_migration
Create Date: 2024-01-10 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '004_template_analytics'
down_revision: Union[str, None] = '003_previous_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade to add template performance analytics tables."""
    
    # Create MetricType enum
    metric_type_enum = postgresql.ENUM(
        'conversion_rate', 'bounce_rate', 'session_duration', 'click_through_rate',
        'page_load_time', 'user_engagement', 'form_completion', 'scroll_depth',
        name='metrictype'
    )
    metric_type_enum.create(op.get_bind())
    
    # Create PerformanceBand enum
    performance_band_enum = postgresql.ENUM(
        'top_performer', 'good', 'average', 'poor', 'underperforming',
        name='performanceband'
    )
    performance_band_enum.create(op.get_bind())
    
    # Create template_analytics table
    op.create_table('template_analytics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        
        # Core metrics
        sa.Column('page_views', sa.Integer(), nullable=False, default=0),
        sa.Column('unique_visitors', sa.Integer(), nullable=False, default=0),
        sa.Column('sessions', sa.Integer(), nullable=False, default=0),
        sa.Column('conversions', sa.Integer(), nullable=False, default=0),
        sa.Column('bounces', sa.Integer(), nullable=False, default=0),
        
        # Performance metrics
        sa.Column('conversion_rate', sa.Float(), nullable=False, default=0.0),
        sa.Column('bounce_rate', sa.Float(), nullable=False, default=0.0),
        sa.Column('avg_session_duration', sa.Float(), nullable=False, default=0.0),
        sa.Column('avg_page_load_time', sa.Float(), nullable=False, default=0.0),
        
        # Engagement metrics
        sa.Column('avg_scroll_depth', sa.Float(), nullable=False, default=0.0),
        sa.Column('form_interactions', sa.Integer(), nullable=False, default=0),
        sa.Column('form_completions', sa.Integer(), nullable=False, default=0),
        sa.Column('cta_clicks', sa.Integer(), nullable=False, default=0),
        
        # User behavior
        sa.Column('returning_visitors', sa.Integer(), nullable=False, default=0),
        sa.Column('new_visitors', sa.Integer(), nullable=False, default=0),
        sa.Column('mobile_users', sa.Integer(), nullable=False, default=0),
        sa.Column('desktop_users', sa.Integer(), nullable=False, default=0),
        
        # Geographical data
        sa.Column('top_countries', sa.JSON(), nullable=False, default=list),
        sa.Column('top_cities', sa.JSON(), nullable=False, default=list),
        
        # Referral sources
        sa.Column('organic_traffic', sa.Integer(), nullable=False, default=0),
        sa.Column('direct_traffic', sa.Integer(), nullable=False, default=0),
        sa.Column('referral_traffic', sa.Integer(), nullable=False, default=0),
        sa.Column('social_traffic', sa.Integer(), nullable=False, default=0),
        sa.Column('paid_traffic', sa.Integer(), nullable=False, default=0),
        
        # Advanced metrics
        sa.Column('user_satisfaction_score', sa.Float(), nullable=True),
        sa.Column('net_promoter_score', sa.Float(), nullable=True),
        sa.Column('task_completion_rate', sa.Float(), nullable=False, default=0.0),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE')
    )
    
    # Create indexes for template_analytics
    op.create_index('idx_template_date', 'template_analytics', ['template_id', 'date'])
    op.create_index('idx_template_conversion', 'template_analytics', ['template_id', 'conversion_rate'])
    op.create_index('idx_date_range', 'template_analytics', ['date'])
    
    # Create template_rankings table
    op.create_table('template_rankings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.String(100), nullable=False),
        
        # Overall scores
        sa.Column('overall_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('performance_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('popularity_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('quality_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('success_score', sa.Float(), nullable=False, default=0.0),
        
        # Ranking positions
        sa.Column('overall_rank', sa.Integer(), nullable=False, default=0),
        sa.Column('category_rank', sa.Integer(), nullable=False, default=0),
        sa.Column('performance_band', performance_band_enum, nullable=False, default='average'),
        
        # Trend indicators
        sa.Column('rank_change_7d', sa.Integer(), nullable=False, default=0),
        sa.Column('rank_change_30d', sa.Integer(), nullable=False, default=0),
        sa.Column('score_change_7d', sa.Float(), nullable=False, default=0.0),
        sa.Column('score_change_30d', sa.Float(), nullable=False, default=0.0),
        
        # Performance metrics aggregated
        sa.Column('avg_conversion_rate', sa.Float(), nullable=False, default=0.0),
        sa.Column('avg_bounce_rate', sa.Float(), nullable=False, default=0.0),
        sa.Column('avg_session_duration', sa.Float(), nullable=False, default=0.0),
        sa.Column('total_usage', sa.Integer(), nullable=False, default=0),
        sa.Column('success_rate', sa.Float(), nullable=False, default=0.0),
        
        # User feedback
        sa.Column('avg_rating', sa.Float(), nullable=False, default=0.0),
        sa.Column('rating_count', sa.Integer(), nullable=False, default=0),
        sa.Column('recommendation_rate', sa.Float(), nullable=False, default=0.0),
        
        # Last analysis
        sa.Column('last_analyzed_at', sa.DateTime(), nullable=False),
        sa.Column('analysis_version', sa.Integer(), nullable=False, default=1),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('template_id')
    )
    
    # Create indexes for template_rankings
    op.create_index('idx_overall_rank', 'template_rankings', ['overall_rank'])
    op.create_index('idx_category_rank', 'template_rankings', ['category', 'category_rank'])
    op.create_index('idx_performance_band', 'template_rankings', ['performance_band'])
    op.create_index('idx_overall_score', 'template_rankings', ['overall_score'])
    
    # Create conversion_events table
    op.create_table('conversion_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        
        # Event details
        sa.Column('event_type', sa.String(100), nullable=False),
        sa.Column('event_value', sa.Float(), nullable=True),
        sa.Column('conversion_funnel_step', sa.Integer(), nullable=False, default=1),
        
        # Session context
        sa.Column('session_id', sa.String(255), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('referrer', sa.Text(), nullable=True),
        
        # Page context
        sa.Column('page_url', sa.Text(), nullable=False),
        sa.Column('page_title', sa.String(200), nullable=True),
        
        # Performance context
        sa.Column('page_load_time', sa.Float(), nullable=True),
        sa.Column('time_on_page', sa.Float(), nullable=True),
        sa.Column('scroll_depth', sa.Float(), nullable=True),
        
        # Additional metadata
        sa.Column('metadata', sa.JSON(), nullable=False, default=dict),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL')
    )
    
    # Create indexes for conversion_events
    op.create_index('idx_template_event', 'conversion_events', ['template_id', 'event_type'])
    op.create_index('idx_session', 'conversion_events', ['session_id'])
    op.create_index('idx_event_date', 'conversion_events', ['created_at'])
    
    # Create template_usage table
    op.create_table('template_usage',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True),
        
        # Usage details
        sa.Column('usage_type', sa.String(50), nullable=False),
        sa.Column('usage_duration', sa.Float(), nullable=True),
        sa.Column('customizations_made', sa.Integer(), nullable=False, default=0),
        
        # Success indicators
        sa.Column('was_published', sa.Boolean(), nullable=False, default=False),
        sa.Column('was_completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('satisfaction_rating', sa.Integer(), nullable=True),
        
        # Workflow success
        sa.Column('workflow_success', sa.Boolean(), nullable=False, default=False),
        sa.Column('workflow_completion_rate', sa.Float(), nullable=True),
        
        # User context
        sa.Column('user_experience_level', sa.String(50), nullable=True),
        sa.Column('user_industry', sa.String(100), nullable=True),
        sa.Column('user_company_size', sa.String(50), nullable=True),
        
        # Performance impact
        sa.Column('achieved_goals', sa.JSON(), nullable=False, default=list),
        sa.Column('performance_improvement', sa.Float(), nullable=True),
        
        # Additional metadata
        sa.Column('metadata', sa.JSON(), nullable=False, default=dict),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='SET NULL')
    )
    
    # Create indexes for template_usage
    op.create_index('idx_template_user', 'template_usage', ['template_id', 'user_id'])
    op.create_index('idx_usage_type', 'template_usage', ['usage_type'])
    op.create_index('idx_success', 'template_usage', ['was_published', 'was_completed'])
    
    # Create template_optimization_recommendations table
    op.create_table('template_optimization_recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Recommendation details
        sa.Column('recommendation_type', sa.String(100), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False, default='medium'),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        
        # Recommendation content
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('implementation_steps', sa.JSON(), nullable=False, default=list),
        
        # Impact predictions
        sa.Column('estimated_improvement', sa.Float(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, default=0.0),
        sa.Column('impact_area', sa.String(100), nullable=False),
        
        # Implementation details
        sa.Column('effort_level', sa.String(20), nullable=False, default='medium'),
        sa.Column('estimated_time_hours', sa.Integer(), nullable=True),
        sa.Column('required_skills', sa.JSON(), nullable=False, default=list),
        
        # Tracking
        sa.Column('was_applied', sa.Boolean(), nullable=False, default=False),
        sa.Column('applied_at', sa.DateTime(), nullable=True),
        sa.Column('actual_improvement', sa.Float(), nullable=True),
        
        # Analysis context
        sa.Column('based_on_data', sa.JSON(), nullable=False, default=dict),
        sa.Column('analysis_version', sa.Integer(), nullable=False, default=1),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['template_id'], ['templates.id'], ondelete='CASCADE')
    )
    
    # Create indexes for template_optimization_recommendations
    op.create_index('idx_template_priority', 'template_optimization_recommendations', ['template_id', 'priority'])
    op.create_index('idx_status', 'template_optimization_recommendations', ['status'])
    op.create_index('idx_recommendation_type', 'template_optimization_recommendations', ['recommendation_type'])
    
    # Add performance tracking columns to existing templates table
    op.add_column('templates', sa.Column('avg_conversion_rate', sa.Float(), nullable=True, default=0.0))
    op.add_column('templates', sa.Column('avg_bounce_rate', sa.Float(), nullable=True, default=0.0))
    op.add_column('templates', sa.Column('success_rate', sa.Float(), nullable=True, default=0.0))
    op.add_column('templates', sa.Column('performance_score', sa.Float(), nullable=True, default=0.0))


def downgrade() -> None:
    """Downgrade to remove template performance analytics tables."""
    
    # Remove added columns from templates table
    op.drop_column('templates', 'performance_score')
    op.drop_column('templates', 'success_rate')
    op.drop_column('templates', 'avg_bounce_rate')
    op.drop_column('templates', 'avg_conversion_rate')
    
    # Drop tables in reverse order
    op.drop_table('template_optimization_recommendations')
    op.drop_table('template_usage')
    op.drop_table('conversion_events')
    op.drop_table('template_rankings')
    op.drop_table('template_analytics')
    
    # Drop enums
    performance_band_enum = postgresql.ENUM(name='performanceband')
    performance_band_enum.drop(op.get_bind(), checkfirst=True)
    
    metric_type_enum = postgresql.ENUM(name='metrictype')
    metric_type_enum.drop(op.get_bind(), checkfirst=True)