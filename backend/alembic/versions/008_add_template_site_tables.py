"""Add missing template and site tables

Revision ID: 008_add_template_site_tables
Revises: 9b57be0f5856
Create Date: 2025-09-07 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '008_add_template_site_tables'
down_revision = '9b57be0f5856'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if tables already exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    # Create templates table if it doesn't exist
    if 'templates' not in existing_tables:
        op.create_table('templates',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('category', sa.String(50), nullable=False),
            sa.Column('status', sa.String(50), nullable=True),
            sa.Column('preview_image', sa.String(500), nullable=True),
            sa.Column('thumbnail_image', sa.String(500), nullable=True),
            sa.Column('demo_url', sa.String(500), nullable=True),
            sa.Column('config', sa.JSON(), nullable=True),
            sa.Column('components', sa.JSON(), nullable=True),
            sa.Column('styles', sa.JSON(), nullable=True),
            sa.Column('tags', sa.JSON(), nullable=True),
            sa.Column('meta_title', sa.String(200), nullable=True),
            sa.Column('meta_description', sa.Text(), nullable=True),
            sa.Column('usage_count', sa.Integer(), nullable=True),
            sa.Column('is_premium', sa.Boolean(), nullable=True),
            sa.Column('is_featured', sa.Boolean(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create template_components table if it doesn't exist
    if 'template_components' not in existing_tables:
        op.create_table('template_components',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('component_type', sa.String(100), nullable=False),
            sa.Column('props', sa.JSON(), nullable=True),
            sa.Column('styles', sa.JSON(), nullable=True),
            sa.Column('html_template', sa.Text(), nullable=True),
            sa.Column('css_styles', sa.Text(), nullable=True),
            sa.Column('javascript', sa.Text(), nullable=True),
            sa.Column('category', sa.String(100), nullable=True),
            sa.Column('tags', sa.JSON(), nullable=True),
            sa.Column('is_responsive', sa.Boolean(), nullable=True),
            sa.Column('is_interactive', sa.Boolean(), nullable=True),
            sa.Column('usage_count', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create projects table if it doesn't exist
    if 'projects' not in existing_tables:
        op.create_table('projects',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('status', sa.String(50), nullable=True),
            sa.Column('owner_id', sa.String(36), nullable=False),
            sa.Column('template_id', sa.String(36), nullable=True),
            sa.Column('config', sa.JSON(), nullable=True),
            sa.Column('custom_css', sa.Text(), nullable=True),
            sa.Column('custom_js', sa.Text(), nullable=True),
            sa.Column('meta_title', sa.String(200), nullable=True),
            sa.Column('meta_description', sa.Text(), nullable=True),
            sa.Column('meta_keywords', sa.JSON(), nullable=True),
            sa.Column('subdomain', sa.String(100), nullable=True),
            sa.Column('custom_domain', sa.String(255), nullable=True),
            sa.Column('is_published', sa.Boolean(), nullable=True),
            sa.Column('published_url', sa.String(500), nullable=True),
            sa.Column('analytics_code', sa.Text(), nullable=True),
            sa.Column('tracking_enabled', sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create project_pages table if it doesn't exist
    if 'project_pages' not in existing_tables:
        op.create_table('project_pages',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('title', sa.String(200), nullable=False),
            sa.Column('slug', sa.String(200), nullable=False),
            sa.Column('content', sa.JSON(), nullable=True),
            sa.Column('is_homepage', sa.Boolean(), nullable=True),
            sa.Column('is_published', sa.Boolean(), nullable=True),
            sa.Column('order_index', sa.Integer(), nullable=True),
            sa.Column('meta_title', sa.String(200), nullable=True),
            sa.Column('meta_description', sa.Text(), nullable=True),
            sa.Column('meta_keywords', sa.JSON(), nullable=True),
            sa.Column('project_id', sa.String(36), nullable=False),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create sites table if it doesn't exist
    if 'sites' not in existing_tables:
        op.create_table('sites',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('user_id', sa.String(36), nullable=False),
            sa.Column('template_id', sa.String(36), nullable=True),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('subdomain', sa.String(100), nullable=True),
            sa.Column('custom_domain', sa.String(255), nullable=True),
            sa.Column('status', sa.String(50), nullable=True),
            sa.Column('published_at', sa.DateTime(), nullable=True),
            sa.Column('settings', sa.JSON(), nullable=True),
            sa.Column('theme_config', sa.JSON(), nullable=True),
            sa.Column('meta_title', sa.String(255), nullable=True),
            sa.Column('meta_description', sa.Text(), nullable=True),
            sa.Column('favicon_url', sa.String(500), nullable=True),
            sa.Column('total_views', sa.Integer(), nullable=True),
            sa.Column('unique_visitors', sa.Integer(), nullable=True),
            sa.Column('conversion_rate', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_sites_custom_domain', 'sites', ['custom_domain'], unique=True)
        op.create_index('ix_sites_subdomain', 'sites', ['subdomain'], unique=True)
    
    # Create components table if it doesn't exist
    if 'components' not in existing_tables:
        op.create_table('components',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('site_id', sa.String(36), nullable=False),
            sa.Column('component_id', sa.String(100), nullable=False),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('type', sa.String(50), nullable=False),
            sa.Column('config', sa.JSON(), nullable=False),
            sa.Column('styles', sa.JSON(), nullable=True),
            sa.Column('position', sa.JSON(), nullable=True),
            sa.Column('order_index', sa.Integer(), nullable=True),
            sa.Column('workflows_connected', sa.JSON(), nullable=True),
            sa.Column('views', sa.Integer(), nullable=True),
            sa.Column('interactions', sa.Integer(), nullable=True),
            sa.Column('conversions', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['site_id'], ['sites.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create published_sites table if it doesn't exist
    if 'published_sites' not in existing_tables:
        op.create_table('published_sites',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('site_id', sa.String(36), nullable=False),
            sa.Column('domain', sa.String(255), nullable=False),
            sa.Column('custom_domain', sa.String(255), nullable=True),
            sa.Column('ssl_status', sa.String(50), nullable=True),
            sa.Column('domain_status', sa.String(50), nullable=True),
            sa.Column('build_status', sa.String(50), nullable=True),
            sa.Column('build_started_at', sa.DateTime(), nullable=True),
            sa.Column('build_completed_at', sa.DateTime(), nullable=True),
            sa.Column('build_duration', sa.Integer(), nullable=True),
            sa.Column('cdn_url', sa.String(500), nullable=True),
            sa.Column('preview_url', sa.String(500), nullable=True),
            sa.Column('seo_settings', sa.JSON(), nullable=True),
            sa.Column('analytics_id', sa.String(100), nullable=True),
            sa.Column('performance_score', sa.Integer(), nullable=True),
            sa.Column('ssl_issued_at', sa.DateTime(), nullable=True),
            sa.Column('ssl_expires_at', sa.DateTime(), nullable=True),
            sa.Column('ssl_provider', sa.String(100), nullable=True),
            sa.Column('build_size', sa.Integer(), nullable=True),
            sa.Column('build_hash', sa.String(64), nullable=True),
            sa.ForeignKeyConstraint(['site_id'], ['sites.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_published_sites_custom_domain', 'published_sites', ['custom_domain'], unique=False)
        op.create_index('ix_published_sites_domain', 'published_sites', ['domain'], unique=False)
    
    # Create deployment_history table if it doesn't exist
    if 'deployment_history' not in existing_tables:
        op.create_table('deployment_history',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.Column('published_site_id', sa.String(36), nullable=False),
            sa.Column('version', sa.String(50), nullable=False),
            sa.Column('tag', sa.String(100), nullable=True),
            sa.Column('build_time', sa.DateTime(), nullable=False),
            sa.Column('build_duration', sa.Integer(), nullable=True),
            sa.Column('build_status', sa.String(50), nullable=False),
            sa.Column('build_logs', sa.Text(), nullable=True),
            sa.Column('build_size', sa.Integer(), nullable=True),
            sa.Column('build_hash', sa.String(64), nullable=True),
            sa.Column('rollback_data', sa.JSON(), nullable=True),
            sa.Column('is_rollback', sa.Boolean(), nullable=True),
            sa.Column('rollback_from_version', sa.String(50), nullable=True),
            sa.Column('performance_score', sa.Integer(), nullable=True),
            sa.Column('load_time', sa.Float(), nullable=True),
            sa.Column('bundle_size', sa.Integer(), nullable=True),
            sa.Column('seo_score', sa.Integer(), nullable=True),
            sa.Column('accessibility_score', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['published_site_id'], ['published_sites.id'], ),
            sa.PrimaryKeyConstraint('id')
        )


def downgrade() -> None:
    # Drop tables in reverse order (only if they exist)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    if 'deployment_history' in existing_tables:
        op.drop_table('deployment_history')
    if 'published_sites' in existing_tables:
        op.drop_index('ix_published_sites_domain', table_name='published_sites')
        op.drop_index('ix_published_sites_custom_domain', table_name='published_sites')
        op.drop_table('published_sites')
    if 'components' in existing_tables:
        op.drop_table('components')
    if 'sites' in existing_tables:
        op.drop_index('ix_sites_subdomain', table_name='sites')
        op.drop_index('ix_sites_custom_domain', table_name='sites')
        op.drop_table('sites')
    if 'project_pages' in existing_tables:
        op.drop_table('project_pages')
    if 'projects' in existing_tables:
        op.drop_table('projects')
    if 'template_components' in existing_tables:
        op.drop_table('template_components')
    if 'templates' in existing_tables:
        op.drop_table('templates')