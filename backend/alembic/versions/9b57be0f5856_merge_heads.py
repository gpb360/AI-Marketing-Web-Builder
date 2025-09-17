"""merge heads

Revision ID: 9b57be0f5856
Revises: 006_sla_optimization_tables, 007_business_context_integration
Create Date: 2025-08-24 13:28:25.766539

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9b57be0f5856'
down_revision = ('006_sla_optimization_tables', '007_business_context_integration')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass