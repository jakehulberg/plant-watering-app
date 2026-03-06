"""Remove moisture_level column

Revision ID: a1b2c3d4e5f6
Revises: bf011f855c1c
Create Date: 2026-03-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'bf011f855c1c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('plant') as batch_op:
        batch_op.drop_column('moisture_level')


def downgrade():
    with op.batch_alter_table('plant') as batch_op:
        batch_op.add_column(sa.Column('moisture_level', sa.Integer(), nullable=True))
