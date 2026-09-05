from app.services.base import BaseService
from app.repositories.enquiry_repository import enquiry_repo

class EnquiryService(BaseService):
    def __init__(self):
        super().__init__(enquiry_repo)

enquiry_service = EnquiryService()
