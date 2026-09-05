from app.repositories.base import BaseRepository
from app.models import Blog
from app.schemas.blog import BlogCreate, BlogUpdate

class BlogRepository(BaseRepository[Blog, BlogCreate, BlogUpdate]):
    pass

blog_repo = BlogRepository(Blog)
