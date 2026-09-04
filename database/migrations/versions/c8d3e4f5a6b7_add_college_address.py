"""Add college address fields

Revision ID: c8d3e4f5a6b7
Revises: b7c2d3e4f5a6
Create Date: 2026-09-05 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c8d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b7c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('colleges', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('colleges', sa.Column('pincode', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('entrance_exam', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('colleges', 'entrance_exam')
    op.drop_column('colleges', 'pincode')
    op.drop_column('colleges', 'address')