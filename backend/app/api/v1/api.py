from fastapi import APIRouter
from app.api.v1.endpoints import (
    colleges,
    auth,
    cms,
    admin_colleges,
    admin_scholarships,
    search,
    enquiries,
    comparison,
    ai,
    scholarships,
)

api_router = APIRouter()

@api_router.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(colleges.router, prefix="/colleges", tags=["Colleges"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(enquiries.router, prefix="/enquiries", tags=["Enquiries"])
api_router.include_router(comparison.router, prefix="/comparison", tags=["Comparison"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(cms.router, prefix="/cms", tags=["CMS"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(admin_scholarships.router, prefix="/admin/scholarships", tags=["Admin-Scholarships"])
api_router.include_router(admin_colleges.router, prefix="/admin/colleges", tags=["Admin-Colleges"])
