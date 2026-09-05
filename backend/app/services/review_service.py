from app.services.base import BaseService
from app.repositories.review_repository import review_repo

class ReviewService(BaseService):
    def __init__(self):
        super().__init__(review_repo)

review_service = ReviewService()
