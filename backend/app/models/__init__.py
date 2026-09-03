from .base import Base
from .user import User, Role, Permission, user_permissions
from .student import StudentProfile, SavedCollege, StudentInterest
from .crm import Counsellor, Enquiry, Lead, LeadActivity, Notification
from .college import College, University, Location, Facility, college_facilities
from .course import Course, CollegeCourse, Fee, Cutoff
from .admission import Exam, Eligibility, AdmissionInformation, Scholarship
from .assessment import QuestionBank, Question, MockTest, MockTestQuestion, TestAttempt, TestResult
from .content import BlogArticle, FAQ, CMSContent, Review, Media
from .system import AnalyticsEvent, AuditLog
from .ai import RAGDocument, DocumentChunk, Embedding
