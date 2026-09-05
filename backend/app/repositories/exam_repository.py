from app.repositories.base import BaseRepository
from app.models import Exam
from app.schemas.exam import ExamCreate, ExamUpdate

class ExamRepository(BaseRepository[Exam, ExamCreate, ExamUpdate]):
    pass

exam_repo = ExamRepository(Exam)
