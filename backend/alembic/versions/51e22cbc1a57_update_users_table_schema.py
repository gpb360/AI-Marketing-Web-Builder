"""update_users_table_schema

Revision ID: 51e22cbc1a57
Revises: 008_add_template_site_tables
Create Date: 2025-09-07 20:11:33.307167

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '51e22cbc1a57'
down_revision = '008_add_template_site_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the index on username column first
    op.drop_index('ix_users_username', table_name='users')
    
    # Drop the username column since we're using email as the unique identifier
    op.drop_column('users', 'username')
    
    # Rename full_name to first_name
    op.alter_column('users', 'full_name', new_column_name='first_name')
    
    # Add missing columns
    op.add_column('users', sa.Column('last_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('is_superuser', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('users', sa.Column('company', sa.String(200), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    
    # Update existing data - set is_superuser to False for all users
    op.execute("UPDATE users SET is_superuser = false")
    
    # Update existing data - set last_name to empty string for all users
    op.execute("UPDATE users SET last_name = '' WHERE first_name IS NOT NULL")


def downgrade() -> None:
    # Add back the username column
    op.add_column('users', sa.Column('username', sa.String(100), nullable=False))
    
    # Recreate the index on username
    op.create_index('ix_users_username', 'users', ['username'])
    
    # Remove added columns
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'company')
    op.drop_column('users', 'is_superuser')
    op.drop_column('users', 'last_name')
    
    # Rename first_name back to full_name
    op.alter_column('users', 'first_name', new_column_name='full_name')