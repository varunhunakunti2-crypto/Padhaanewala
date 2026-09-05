from app.repositories.base import BaseRepository
from app.models import Scholarship
from app.schemas.scholarship import ScholarshipCreate, ScholarshipUpdate

class ScholarshipRepository(BaseRepository[Scholarship, ScholarshipCreate, ScholarshipUpdate]):
    pass

scholarship_repo = ScholarshipRepository(Scholarship)
