from fastapi import APIRouter
from app.api.v1.endpoints import colleges, auth, cms, admin_colleges, admin_courses, search
from app.api.v1.endpoints import users, courses, universities, locations, facilities, scholarships, exams, mock_tests, reviews, blogs, faqs, banners, notifications, enquiries, leads, counsellors, predictor, ai, comparison, media, analytics, dashboard

api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(cms.router, prefix="/cms", tags=["CMS"])
api_router.include_router(admin_colleges.router, prefix="/admin/colleges", tags=["Admin-Colleges"])
api_router.include_router(admin_courses.router, prefix="/admin/courses", tags=["Admin-Courses"])

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(universities.router, prefix="/universities", tags=["Universities"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(facilities.router, prefix="/facilities", tags=["Facilities"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(exams.router, prefix="/exams", tags=["Exams"])
api_router.include_router(mock_tests.router, prefix="/mock-tests", tags=["Mock Tests"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["Blogs"])
api_router.include_router(faqs.router, prefix="/faqs", tags=["Faqs"])
api_router.include_router(banners.router, prefix="/banners", tags=["Banners"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(enquiries.router, prefix="/enquiries", tags=["Enquiries"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(counsellors.router, prefix="/counsellors", tags=["Counsellors"])
api_router.include_router(predictor.router, prefix="/predictor", tags=["Predictor"])
api_router.include_router(ai.router, prefix="/ai", tags=["Ai"])
api_router.include_router(comparison.router, prefix="/comparison", tags=["Comparison"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])