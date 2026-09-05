from app.repositories.base import BaseRepository
from app.models import Enquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryUpdate

class EnquiryRepository(BaseRepository[Enquiry, EnquiryCreate, EnquiryUpdate]):
    pass

enquiry_repo = EnquiryRepository(Enquiry)
