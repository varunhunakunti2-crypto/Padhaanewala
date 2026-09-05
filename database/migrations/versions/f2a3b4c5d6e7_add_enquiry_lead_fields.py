"""Add enquiry lead intake fields

Revision ID: f2a3b4c5d6e7
Revises: e1a2b3c4d5e6
Create Date: 2026-09-05 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f2a3b4c5d6e7'
down_revision: Union[str, Sequence[str], None] = 'e1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('enquiries', sa.Column('mobile', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('course', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('preferred_college', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('state', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('source', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('utm_source', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('utm_medium', sa.String(), nullable=True))
    op.add_column('enquiries', sa.Column('utm_campaign', sa.String(), nullable=True))
    op.alter_column('enquiries', 'email', existing_type=sa.String(), nullable=True)
    op.create_index(op.f('ix_enquiries_mobile'), 'enquiries', ['mobile'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_enquiries_mobile'), table_name='enquiries')
    op.alter_column('enquiries', 'email', existing_type=sa.String(), nullable=False)
    op.drop_column('enquiries', 'utm_campaign')
    op.drop_column('enquiries', 'utm_medium')
    op.drop_column('enquiries', 'utm_source')
    op.drop_column('enquiries', 'source')
    op.drop_column('enquiries', 'state')
    op.drop_column('enquiries', 'preferred_college')
    op.drop_column('enquiries', 'course')
    op.drop_column('enquiries', 'mobile')