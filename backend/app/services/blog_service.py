from app.services.base import BaseService
from app.repositories.blog_repository import blog_repo

class BlogService(BaseService):
    def __init__(self):
        super().__init__(blog_repo)

blog_service = BlogService()
