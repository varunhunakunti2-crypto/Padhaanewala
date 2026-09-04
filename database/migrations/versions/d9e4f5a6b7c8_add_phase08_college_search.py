"""Phase 08 — college search: tsvector/trigram search + filter indexes

Revision ID: d9e4f5a6b7c8
Revises: c8d3e4f5a6b7
Create Date: 2026-09-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd9e4f5a6b7c8'
down_revision: Union[str, Sequence[str], None] = 'c8d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_SEARCH_COLUMNS = (
    "COALESCE(name, '') || ' ' || COALESCE(official_name, '') "
    "|| ' ' || COALESCE(college_code, '')"
)

_COLLEGE_SEARCH_VECTOR_UPDATE_FN = """
CREATE FUNCTION colleges_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector(
        'english',
        COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.official_name, '')
        || ' ' || COALESCE(NEW.college_code, '')
    );
    RETURN NEW;
END
$$ LANGUAGE plpgsql
"""


def upgrade() -> None:
    """Upgrade schema."""
    # Full-text + trigram search
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX ix_colleges_name_trgm ON colleges "
        "USING gin (lower(name) gin_trgm_ops)"
    )
    op.execute(
        f"UPDATE colleges SET search_vector = to_tsvector('english', {_SEARCH_COLUMNS}) "
        "WHERE search_vector IS NULL"
    )
    op.create_index('ix_colleges_search_vector', 'colleges', ['search_vector'], unique=False, postgresql_using='gin')
    op.execute(_COLLEGE_SEARCH_VECTOR_UPDATE_FN)
    op.execute(
        "CREATE TRIGGER trg_colleges_search_vector_update "
        "BEFORE INSERT OR UPDATE OF name, official_name, college_code ON colleges "
        "FOR EACH ROW EXECUTE FUNCTION colleges_search_vector_update()"
    )

    # Filter column indexes (Phase 08 / Phase 07 filters)
    op.create_index(op.f('ix_colleges_college_type'), 'colleges', ['college_type'], unique=False)
    op.create_index(op.f('ix_colleges_is_private'), 'colleges', ['is_private'], unique=False)
    op.create_index(op.f('ix_colleges_accreditation'), 'colleges', ['accreditation'], unique=False)
    op.create_index(op.f('ix_colleges_admission_status'), 'colleges', ['admission_status'], unique=False)
    op.create_index(op.f('ix_colleges_rating'), 'colleges', ['rating'], unique=False)
    op.create_index(op.f('ix_colleges_has_hostel'), 'colleges', ['has_hostel'], unique=False)
    op.create_index(op.f('ix_colleges_university_id'), 'colleges', ['university_id'], unique=False)
    op.create_index(op.f('ix_colleges_location_id'), 'colleges', ['location_id'], unique=False)
    op.create_index('ix_college_courses_college_id_fees', 'college_courses', ['college_id', 'fees'], unique=False)
    op.create_index('ix_college_courses_course_id', 'college_courses', ['course_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_college_courses_course_id', table_name='college_courses')
    op.drop_index('ix_college_courses_college_id_fees', table_name='college_courses')
    op.drop_index(op.f('ix_colleges_location_id'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_university_id'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_has_hostel'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_rating'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_admission_status'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_accreditation'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_is_private'), table_name='colleges')
    op.drop_index(op.f('ix_colleges_college_type'), table_name='colleges')
    op.execute("DROP TRIGGER IF EXISTS trg_colleges_search_vector_update ON colleges")
    op.execute("DROP FUNCTION IF EXISTS colleges_search_vector_update()")
    op.drop_index('ix_colleges_search_vector', table_name='colleges')
    op.drop_index('ix_colleges_name_trgm', table_name='colleges')
    op.execute("DROP EXTENSION IF EXISTS pg_trgm")