"""Remove watering_interval_days column

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('plant') as batch_op:
        batch_op.drop_column('watering_interval_days')


def downgrade():
    with op.batch_alter_table('plant') as batch_op:
        batch_op.add_column(sa.Column('watering_interval_days', sa.Integer(), nullable=True))
