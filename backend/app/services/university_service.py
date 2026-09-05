from app.services.base import BaseService
from app.repositories.university_repository import university_repo

class UniversityService(BaseService):
    def __init__(self):
        super().__init__(university_repo)

university_service = UniversityService()
