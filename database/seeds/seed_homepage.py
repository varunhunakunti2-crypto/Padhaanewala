"""Seed demo content for the Padhaanewala homepage (Phase 6).

Idempotent: upserts the 5 admin-editable "static" sections that compose the
homepage. Live sections (scholarships / exams / mock-tests / reviews / articles)
are pulled straight from their tables by GET /api/v1/cms/homepage.

Usage (from repo root, with backend venv active):
  python -m database.seeds.seed_homepage
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models import HomepageContent

DEFAULT_SECTIONS = [
    {
        "section": "hero",
        "order": 1,
        "title": "Hero",
        "content": {
            "heading": "Find the Right College for Your Future",
            "subtitle": "Search 10,000+ verified colleges, courses, scholarships and exams across India.",
            "search_placeholder": "Search colleges, courses, exams or locations",
            "search_button_label": "Search",
            "predictor_button_label": "AI College Predictor",
        },
    },
    {
        "section": "quick_actions",
        "order": 2,
        "title": "Quick Actions",
        "content": {
            "items": [
                {"label": "Find Colleges", "href": "/colleges", "description": "Explore verified colleges", "icon": "building"},
                {"label": "Compare Colleges", "href": "/compare", "description": "Compare side by side", "icon": "scale"},
                {"label": "College Predictor", "href": "/college-predictor", "description": "Predict your admission chances", "icon": "sparkles"},
                {"label": "Scholarships", "href": "/scholarships", "description": "Find funding that fits", "icon": "rupee"},
                {"label": "Mock Tests", "href": "/mock-tests", "description": "Practice for entrance exams", "icon": "pen"},
                {"label": "Admission Assistance", "href": "/contact", "description": "Talk to a counsellor", "icon": "headset"},
            ]
        },
    },
    {
        "section": "popular_searches",
        "order": 3,
        "title": "Popular College Searches",
        "content": {
            "items": [
                {"label": "BHMS colleges in Karnataka", "query": "BHMS colleges in Karnataka", "href": "/colleges?q=BHMS%20colleges%20in%20Karnataka"},
                {"label": "BAMS colleges near Bangalore", "query": "BAMS colleges near Bangalore", "href": "/colleges?q=BAMS%20colleges%20near%20Bangalore"},
                {"label": "Nursing colleges in Bihar", "query": "Nursing colleges in Bihar", "href": "/colleges?q=Nursing%20colleges%20in%20Bihar"},
                {"label": "B.Pharm colleges in Bangalore", "query": "B.Pharm colleges in Bangalore", "href": "/colleges?q=B.Pharm%20colleges%20in%20Bangalore"},
                {"label": "Private BHMS colleges with hostel", "query": "Private BHMS colleges with hostel", "href": "/colleges?q=Private%20BHMS%20colleges%20with%20hostel"},
            ]
        },
    },
    {
        "section": "why_us",
        "order": 4,
        "title": "Why Padhaanewala",
        "content": {
            "items": [
                {"title": "Verified Data", "description": "Colleges, fees and cutoffs carry a source and last-verified date.", "icon": "shield"},
                {"title": "One Platform, All Answers", "description": "Colleges, courses, exams, scholarships, mock tests and AI guidance together.", "icon": "layers"},
                {"title": "Free Guidance", "description": "Counselling and admission assistance to help you decide with confidence.", "icon": "heart"},
                {"title": "AI That Stays Honest", "description": "AI recommendations are built on verified database facts, never made up.", "icon": "bot"},
            ]
        },
    },
    {
        "section": "cta",
        "order": 5,
        "title": "Admission Assistance CTA",
        "content": {
            "title": "Confused about admission?",
            "subtitle": "Share your details and our counsellor will contact you with free admission guidance.",
            "button_label": "Get Admission Assistance",
            "button_href": "/contact",
        },
    },
]


async def _upsert(session: AsyncSession, payload: dict) -> None:
    result = await session.execute(
        select(HomepageContent).where(HomepageContent.section == payload["section"])
    )
    record = result.scalars().first()
    if record:
        record.title = payload["title"]
        record.content = payload["content"]
        record.order = payload["order"]
        record.is_active = True
    else:
        record = HomepageContent(
            section=payload["section"],
            title=payload["title"],
            content=payload["content"],
            order=payload["order"],
            is_active=True,
        )
        session.add(record)


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        for payload in DEFAULT_SECTIONS:
            await _upsert(session, payload)
        await session.commit()
        print(f"Homepage demo content seeded: {len(DEFAULT_SECTIONS)} sections (upserted).")


if __name__ == "__main__":
    asyncio.run(main())