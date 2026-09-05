import asyncio
import json
from uuid import uuid4
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.education import Course

# Seed data based on user request examples
COURSES_DATA = [
    {
        "name": "Bachelor of Medicine and Bachelor of Surgery",
        "slug": "mbbs",
        "level": "Undergraduate",
        "degree": "MBBS",
        "duration_months": 66,
        "eligibility": "10+2 with Physics, Chemistry, and Biology (Minimum 50% marks). Minimum age 17 years.",
        "entrance_exam": "NEET UG",
        "admission_procedure": "Admission is based solely on the NEET UG score followed by MCC or state counseling.",
        "career_info": "Medical Officer, General Physician, Surgeon (after PG), Healthcare Administrator, Medical Researcher.",
        "description": "MBBS is a 5.5-year undergraduate medical degree program that equips students with the knowledge and skills to practice medicine and surgery.",
        "fee_info": "Government colleges: ₹50,000 - ₹2 Lakhs\nPrivate colleges: ₹10 Lakhs - ₹1 Crore+",
        "meta_title": "MBBS Course Details - Eligibility, Fees & Top Colleges",
        "meta_description": "Everything about the MBBS degree in India. Find out NEET cutoffs, admission procedures, and career opportunities.",
        "is_published": True
    },
    {
        "name": "Bachelor of Dental Surgery",
        "slug": "bds",
        "level": "Undergraduate",
        "degree": "BDS",
        "duration_months": 60,
        "eligibility": "10+2 with PCB (Minimum 50% marks).",
        "entrance_exam": "NEET UG",
        "admission_procedure": "Through NEET UG counseling.",
        "career_info": "Dentist, Dental Surgeon, Oral Pathologist, Public Health Specialist.",
        "description": "BDS is a 5-year undergraduate program focusing on dental sciences and surgeries.",
        "fee_info": "₹1 Lakh - ₹40 Lakhs depending on govt/private.",
        "meta_title": "BDS Course - Admission, Eligibility, Colleges",
        "meta_description": "Learn about Bachelor of Dental Surgery (BDS). See entrance exams, duration, and top dental colleges in India.",
        "is_published": True
    },
    {
        "name": "Bachelor of Ayurvedic Medicine and Surgery",
        "slug": "bams",
        "level": "Undergraduate",
        "degree": "BAMS",
        "duration_months": 66,
        "eligibility": "10+2 with PCB. Knowledge of Sanskrit is an advantage.",
        "entrance_exam": "NEET UG",
        "admission_procedure": "AYUSH counseling based on NEET scores.",
        "career_info": "Ayurvedic Doctor, Medical Officer, Health Supervisor.",
        "description": "BAMS focuses on the traditional Indian system of Ayurveda.",
        "fee_info": "₹50,000 to ₹15 Lakhs",
        "meta_title": "BAMS Course - Fees, Colleges & Career",
        "meta_description": "Comprehensive details about the BAMS degree. Ayurveda courses, colleges, and admission info.",
        "is_published": True
    },
    {
        "name": "Bachelor of Technology (Computer Science)",
        "slug": "btech-cse",
        "level": "Undergraduate",
        "degree": "B.Tech/B.E.",
        "duration_months": 48,
        "eligibility": "10+2 with Physics, Chemistry, and Mathematics (PCM).",
        "entrance_exam": "JEE Main, JEE Advanced, State CETs",
        "admission_procedure": "JoSAA/CSAB counseling or state-level counseling.",
        "career_info": "Software Engineer, Data Scientist, Systems Analyst, Cloud Architect.",
        "description": "The most sought-after engineering branch focusing on computer programming and hardware.",
        "fee_info": "₹4 Lakhs - ₹20 Lakhs",
        "meta_title": "B.Tech Computer Science (CSE) Course Guide",
        "meta_description": "Find top engineering colleges for B.Tech in CSE. View JEE cutoffs and placement stats.",
        "is_published": True
    },
    {
        "name": "Master of Business Administration",
        "slug": "mba",
        "level": "Postgraduate",
        "degree": "MBA",
        "duration_months": 24,
        "eligibility": "Bachelor's degree in any discipline with a minimum of 50%.",
        "entrance_exam": "CAT, XAT, MAT, CMAT",
        "admission_procedure": "Entrance exam followed by GD and PI.",
        "career_info": "Marketing Manager, Financial Analyst, HR Manager, Operations Head.",
        "description": "A 2-year postgraduate program covering various aspects of business management.",
        "fee_info": "₹2 Lakhs - ₹30 Lakhs",
        "meta_title": "MBA Course - Fees, Exams & Top B-Schools",
        "meta_description": "Top MBA colleges in India. Learn about CAT, admissions, specializations and career paths.",
        "is_published": True
    },
    {
        "name": "Bachelor of Pharmacy",
        "slug": "b-pharm",
        "level": "Undergraduate",
        "degree": "B.Pharm",
        "duration_months": 48,
        "eligibility": "10+2 with PCB/PCM.",
        "entrance_exam": "State Pharmacy Entrance Exams, NEET (in some cases)",
        "admission_procedure": "State counseling.",
        "career_info": "Pharmacist, Drug Inspector, Quality Control Associate.",
        "description": "A 4-year undergraduate program focusing on the properties and impacts of medicines.",
        "fee_info": "₹2 Lakhs - ₹8 Lakhs",
        "meta_title": "B.Pharm Course - Top Pharmacy Colleges",
        "meta_description": "Admission guide for Bachelor of Pharmacy. Check syllabus, fees, and career scope.",
        "is_published": True
    },
]

async def seed_courses():
    async with SessionLocal() as session:
        for course_data in COURSES_DATA:
            slug = course_data["slug"]
            result = await session.execute(select(Course).where(Course.slug == slug))
            existing = result.scalars().first()
            if existing:
                print(f"Course '{slug}' already exists. Updating...")
                for key, value in course_data.items():
                    setattr(existing, key, value)
            else:
                print(f"Creating course '{slug}'...")
                new_course = Course(**course_data)
                session.add(new_course)
        
        await session.commit()
        print("Course seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_courses())
