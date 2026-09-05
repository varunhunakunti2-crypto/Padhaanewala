from app.repositories.base import BaseRepository
from app.models import Review
from app.schemas.review import ReviewCreate, ReviewUpdate

class ReviewRepository(BaseRepository[Review, ReviewCreate, ReviewUpdate]):
    pass

review_repo = ReviewRepository(Review)
