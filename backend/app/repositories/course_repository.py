from app.repositories.base import BaseRepository
from app.models import Course
from app.schemas.course import CourseCreate, CourseUpdate

class CourseRepository(BaseRepository[Course, CourseCreate, CourseUpdate]):
    pass

course_repo = CourseRepository(Course)
