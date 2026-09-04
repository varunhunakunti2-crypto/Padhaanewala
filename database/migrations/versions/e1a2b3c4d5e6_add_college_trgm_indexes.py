"""Add trigram indexes for college official_name and college_code search

Revision ID: e1a2b3c4d5e6
Revises: d9e4f5a6b7c8
Create Date: 2026-09-05 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e1a2b3c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'd9e4f5a6b7c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        "CREATE INDEX ix_colleges_official_name_trgm ON colleges "
        "USING gin (lower(official_name) gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX ix_colleges_college_code_trgm ON colleges "
        "USING gin (lower(college_code) gin_trgm_ops)"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_colleges_college_code_trgm")
    op.execute("DROP INDEX IF EXISTS ix_colleges_official_name_trgm")