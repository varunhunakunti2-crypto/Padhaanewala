from app.repositories.base import BaseRepository
from app.models import University
from app.schemas.university import UniversityCreate, UniversityUpdate

class UniversityRepository(BaseRepository[University, UniversityCreate, UniversityUpdate]):
    pass

university_repo = UniversityRepository(University)
