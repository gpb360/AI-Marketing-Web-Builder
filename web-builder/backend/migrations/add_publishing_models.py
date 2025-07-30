"""Add publishing models for site generation and deployment.

Revision ID: add_publishing_models
Revises: base
Create Date: 2025-07-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_publishing_models'
down_revision = 'base'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    build_status_enum = postgresql.ENUM(
        'PENDING', 'BUILDING', 'SUCCESS', 'FAILED', 'CANCELLED',
        name='buildstatus'
    )
    build_status_enum.create(op.get_bind())
    
    ssl_status_enum = postgresql.ENUM(
        'PENDING', 'ACTIVE', 'FAILED', 'EXPIRED',
        name='sslstatus'
    )
    ssl_status_enum.create(op.get_bind())
    
    domain_status_enum = postgresql.ENUM(
        'PENDING', 'VERIFIED', 'FAILED', 'DNS_ERROR',
        name='domainstatus'
    )
    domain_status_enum.create(op.get_bind())
    
    # Create published_sites table
    op.create_table('published_sites',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('site_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=False),
        sa.Column('custom_domain', sa.String(length=255), nullable=True),
        sa.Column('ssl_status', ssl_status_enum, nullable=False),
        sa.Column('domain_status', domain_status_enum, nullable=False),
        sa.Column('build_status', build_status_enum, nullable=False),
        sa.Column('build_started_at', sa.DateTime(), nullable=True),
        sa.Column('build_completed_at', sa.DateTime(), nullable=True),
        sa.Column('build_duration', sa.Integer(), nullable=True),
        sa.Column('cdn_url', sa.String(length=500), nullable=True),
        sa.Column('preview_url', sa.String(length=500), nullable=True),
        sa.Column('seo_settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('analytics_id', sa.String(length=100), nullable=True),
        sa.Column('performance_score', sa.Integer(), nullable=True),
        sa.Column('ssl_issued_at', sa.DateTime(), nullable=True),
        sa.Column('ssl_expires_at', sa.DateTime(), nullable=True),
        sa.Column('ssl_provider', sa.String(length=100), nullable=True),
        sa.Column('build_size', sa.Integer(), nullable=True),
        sa.Column('build_hash', sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(['site_id'], ['sites.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_published_sites_domain'), 'published_sites', ['domain'], unique=False)
    op.create_index(op.f('ix_published_sites_custom_domain'), 'published_sites', ['custom_domain'], unique=False)
    
    # Create deployment_history table
    op.create_table('deployment_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('published_site_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('tag', sa.String(length=100), nullable=True),
        sa.Column('build_time', sa.DateTime(), nullable=False),
        sa.Column('build_duration', sa.Integer(), nullable=True),
        sa.Column('build_status', build_status_enum, nullable=False),
        sa.Column('build_logs', sa.Text(), nullable=True),
        sa.Column('build_size', sa.Integer(), nullable=True),
        sa.Column('build_hash', sa.String(length=64), nullable=True),
        sa.Column('rollback_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_rollback', sa.Boolean(), nullable=True),
        sa.Column('rollback_from_version', sa.String(length=50), nullable=True),
        sa.Column('performance_score', sa.Integer(), nullable=True),
        sa.Column('load_time', sa.Float(), nullable=True),
        sa.Column('bundle_size', sa.Integer(), nullable=True),
        sa.Column('seo_score', sa.Integer(), nullable=True),
        sa.Column('accessibility_score', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['published_site_id'], ['published_sites.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Set default values for enum columns
    op.execute("ALTER TABLE published_sites ALTER COLUMN ssl_status SET DEFAULT 'PENDING'")
    op.execute("ALTER TABLE published_sites ALTER COLUMN domain_status SET DEFAULT 'PENDING'")
    op.execute("ALTER TABLE published_sites ALTER COLUMN build_status SET DEFAULT 'PENDING'")
    op.execute("ALTER TABLE published_sites ALTER COLUMN ssl_provider SET DEFAULT 'Let''s Encrypt'")
    op.execute("ALTER TABLE deployment_history ALTER COLUMN is_rollback SET DEFAULT false")


def downgrade():
    # Drop tables
    op.drop_table('deployment_history')
    op.drop_index(op.f('ix_published_sites_custom_domain'), table_name='published_sites')
    op.drop_index(op.f('ix_published_sites_domain'), table_name='published_sites')
    op.drop_table('published_sites')
    
    # Drop enum types
    op.execute('DROP TYPE domainstatus')
    op.execute('DROP TYPE sslstatus')
    op.execute('DROP TYPE buildstatus')