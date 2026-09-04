import asyncio
import os
import sys

# Add backend directory to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models import Base, Location, University, College, Course, CollegeCourse
from app.models.user import User, Role
from app.models.rag import DocumentEmbedding
import random

async def seed_data(session: AsyncSession):
    # 1. Location
    loc = Location(state="Maharashtra", city="Mumbai", pincode="400001")
    session.add(loc)
    await session.commit()
    await session.refresh(loc)

    # 2. Roles
    admin_role = Role(name="Admin", description="System Administrator")
    student_role = Role(name="Student", description="Student User")
    session.add_all([admin_role, student_role])
    await session.commit()

    # 3. University & College
    uni = University(name="Mumbai University", location_id=loc.id)
    session.add(uni)
    await session.commit()
    await session.refresh(uni)

    college = College(
        college_code="COLLEGE000001",
        name="Veermata Jijabai Technological Institute",
        university_id=uni.id,
        location_id=loc.id
    )
    session.add(college)
    await session.commit()
    await session.refresh(college)
    
    # 3.5 RAG Document Embeddings
    dummy_vector_1 = [random.random() for _ in range(1536)]
    dummy_vector_2 = [random.random() for _ in range(1536)]
    
    doc1 = DocumentEmbedding(
        source_table="colleges",
        source_id=college.id,
        chunk_text="VJTI is one of the premier engineering colleges in Mumbai.",
        chunk_index=0,
        embedding=dummy_vector_1,
        embedding_model="text-embedding-3-small"
    )
    doc2 = DocumentEmbedding(
        source_table="colleges",
        source_id=college.id,
        chunk_text="VJTI offers B.Tech and M.Tech courses.",
        chunk_index=1,
        embedding=dummy_vector_2,
        embedding_model="text-embedding-3-small"
    )
    session.add_all([doc1, doc2])
    await session.commit()
    
    print("Seed data inserted successfully.")
    
    # 4. Validation: Check Unique Constraint on college_code
    try:
        dup_college = College(
            college_code="COLLEGE000001",
            name="Another College",
        )
        session.add(dup_college)
        await session.commit()
        print("ERROR: Unique constraint on college_code failed to trigger!")
    except IntegrityError:
        await session.rollback()
        print("SUCCESS: Unique constraint on college_code caught duplicate insert.")

    # 5. Validation: Basic similarity query
    print("Running basic similarity query...")
    query_vector = [random.random() for _ in range(1536)]
    # Use vector cosine distance operator (<=>) for HNSW with vector_cosine_ops
    result = await session.execute(
        text("SELECT chunk_text FROM document_embeddings ORDER BY embedding <=> :v LIMIT 2"),
        {"v": str(query_vector)}
    )
    rows = result.fetchall()
    print("Similarity Query Results:")
    for r in rows:
        print(f"- {r[0]}")


async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        await seed_data(session)

if __name__ == "__main__":
    asyncio.run(main())
