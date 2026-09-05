"""Add scholarship phase 12 fields

Revision ID: a1b2c3d4e5f6
Revises: f2a3b4c5d6e7
Create Date: 2026-09-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f2a3b4c5d6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('scholarships', sa.Column('slug', sa.String(), nullable=True))
    op.add_column('scholarships', sa.Column('is_government', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('scholarships', sa.Column('income_criteria', sa.Text(), nullable=True))
    op.add_column('scholarships', sa.Column('deadline', sa.Date(), nullable=True))
    op.add_column('scholarships', sa.Column('documents', sa.Text(), nullable=True))
    op.add_column('scholarships', sa.Column('application_procedure', sa.Text(), nullable=True))
    op.add_column('scholarships', sa.Column('official_application_url', sa.String(), nullable=True))
    op.add_column('scholarships', sa.Column('status', sa.String(), server_default='active', nullable=False))
    op.create_index(op.f('ix_scholarships_slug'), 'scholarships', ['slug'], unique=True)
    op.create_index(op.f('ix_scholarships_deadline'), 'scholarships', ['deadline'], unique=False)
    op.create_index(op.f('ix_scholarships_status'), 'scholarships', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_scholarships_status'), table_name='scholarships')
    op.drop_index(op.f('ix_scholarships_deadline'), table_name='scholarships')
    op.drop_index(op.f('ix_scholarships_slug'), table_name='scholarships')
    op.drop_column('scholarships', 'status')
    op.drop_column('scholarships', 'official_application_url')
    op.drop_column('scholarships', 'application_procedure')
    op.drop_column('scholarships', 'documents')
    op.drop_column('scholarships', 'deadline')
    op.drop_column('scholarships', 'income_criteria')
    op.drop_column('scholarships', 'is_government')
    op.drop_column('scholarships', 'slug')