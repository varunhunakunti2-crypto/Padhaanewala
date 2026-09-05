from app.services.base import BaseService
from app.repositories.scholarship_repository import scholarship_repo

class ScholarshipService(BaseService):
    def __init__(self):
        super().__init__(scholarship_repo)

scholarship_service = ScholarshipService()
