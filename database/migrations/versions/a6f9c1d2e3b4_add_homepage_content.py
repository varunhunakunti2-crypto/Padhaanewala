"""Add homepage content table

Revision ID: a6f9c1d2e3b4
Revises: e8fa603fb463
Create Date: 2026-09-04 20:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a6f9c1d2e3b4'
down_revision: Union[str, Sequence[str], None] = 'e8fa603fb463'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('homepage_content',
    sa.Column('section', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('content', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_homepage_content_id'), 'homepage_content', ['id'], unique=False)
    op.create_index(op.f('ix_homepage_content_section'), 'homepage_content', ['section'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_homepage_content_section'), table_name='homepage_content')
    op.drop_index(op.f('ix_homepage_content_id'), table_name='homepage_content')
    op.drop_table('homepage_content')