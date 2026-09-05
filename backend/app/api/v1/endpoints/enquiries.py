from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db
from app.models.crm import Enquiry
from app.schemas.common import ResponseModel
from app.schemas.enquiry import EnquiryCreate, EnquiryRead

router = APIRouter()


@router.post("/", response_model=ResponseModel[EnquiryRead], status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    *,
    session: AsyncSession = Depends(get_db),
    enquiry_in: EnquiryCreate,
) -> Any:
    """Public admission-assistance enquiry intake. Creates a lead-quality
    record so counsellors can follow up; no authentication required."""
    subject = "Admission assistance"
    if enquiry_in.preferred_college:
        subject = f"Admission assistance — {enquiry_in.preferred_college}"
    elif enquiry_in.course:
        subject = f"Admission assistance — {enquiry_in.course}"

    enquiry = Enquiry(
        name=enquiry_in.name,
        mobile=enquiry_in.mobile,
        email=enquiry_in.email,
        subject=subject,
        course=enquiry_in.course,
        preferred_college=enquiry_in.preferred_college,
        state=enquiry_in.state,
        message=enquiry_in.message or "",
        source=enquiry_in.source,
        utm_source=enquiry_in.utm_source,
        utm_medium=enquiry_in.utm_medium,
        utm_campaign=enquiry_in.utm_campaign,
        status="new",
    )
    session.add(enquiry)
    await session.commit()
    await session.refresh(enquiry)

    return ResponseModel(
        message="Enquiry submitted — a counsellor will get back to you.",
        data=EnquiryRead(
            id=str(enquiry.id),
            name=enquiry.name,
            mobile=enquiry.mobile,
            email=enquiry.email,
            subject=enquiry.subject,
            course=enquiry.course,
            preferred_college=enquiry.preferred_college,
            state=enquiry.state,
            message=enquiry.message,
            status=enquiry.status,
            created_at=enquiry.created_at,
        ),
    )