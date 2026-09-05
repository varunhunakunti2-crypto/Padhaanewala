from app.services.base import BaseService
from app.repositories.exam_repository import exam_repo

class ExamService(BaseService):
    def __init__(self):
        super().__init__(exam_repo)

exam_service = ExamService()
