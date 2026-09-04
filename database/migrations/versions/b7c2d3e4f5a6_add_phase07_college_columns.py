"""Add Phase 07 college detail columns

Revision ID: b7c2d3e4f5a6
Revises: a6f9c1d2e3b4
Create Date: 2026-09-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'a6f9c1d2e3b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('locations', sa.Column('district', sa.String(), nullable=True))
    op.create_index(op.f('ix_locations_district'), 'locations', ['district'], unique=False)
    op.add_column('colleges', sa.Column('slug', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('official_name', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('college_type', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('is_private', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    op.add_column('colleges', sa.Column('accreditation', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('recognition', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('established_year', sa.Integer(), nullable=True))
    op.add_column('colleges', sa.Column('website', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('email', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('admission_status', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('rating', sa.Float(), nullable=True))
    op.add_column('colleges', sa.Column('has_hostel', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('colleges', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('colleges', sa.Column('longitude', sa.Float(), nullable=True))
    op.add_column('colleges', sa.Column('google_maps_url', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('google_place_id', sa.String(), nullable=True))
    op.add_column('colleges', sa.Column('is_published', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('colleges', sa.Column('verified_by_id', sa.UUID(), nullable=True))
    op.create_foreign_key(None, 'colleges', 'users', ['verified_by_id'], ['id'], ondelete='SET NULL')
    op.create_index(op.f('ix_colleges_slug'), 'colleges', ['slug'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_colleges_slug'), table_name='colleges')
    op.drop_constraint(None, 'colleges', type_='foreignkey')
    op.drop_column('colleges', 'verified_by_id')
    op.drop_column('colleges', 'is_published')
    op.drop_column('colleges', 'google_place_id')
    op.drop_column('colleges', 'google_maps_url')
    op.drop_column('colleges', 'longitude')
    op.drop_column('colleges', 'latitude')
    op.drop_column('colleges', 'has_hostel')
    op.drop_column('colleges', 'rating')
    op.drop_column('colleges', 'admission_status')
    op.drop_column('colleges', 'phone')
    op.drop_column('colleges', 'email')
    op.drop_column('colleges', 'website')
    op.drop_column('colleges', 'established_year')
    op.drop_column('colleges', 'recognition')
    op.drop_column('colleges', 'accreditation')
    op.drop_column('colleges', 'is_private')
    op.drop_column('colleges', 'college_type')
    op.drop_column('colleges', 'official_name')
    op.drop_column('colleges', 'slug')
    op.drop_index(op.f('ix_locations_district'), table_name='locations')
    op.drop_column('locations', 'district')