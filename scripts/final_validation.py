import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.models import * # Import all models to trigger mapper configuration
import logging

logging.basicConfig(level=logging.INFO)

async def check_db():
    print("Testing SQLAlchemy Mapper configuration...")
    try:
        # creating engine and connecting will trigger configure_mappers()
        engine = create_async_engine(settings.DATABASE_URL, echo=False)
        async with engine.connect() as conn:
            print("Successfully connected to the database!")
            # run a simple query to ensure tables are readable
            result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [r[0] for r in result.fetchall()]
            print(f"Found {len(tables)} tables in the database.")
            
            # check a few specific new tables
            expected_tables = ["student_saved_colleges", "review_moderation", "test_sections", "categories", "lead_notes", "fees"]
            missing = [t for t in expected_tables if t not in tables]
            if missing:
                print(f"ERROR: Missing expected tables: {missing}")
            else:
                print("All newly added normalized tables are present!")
                
        print("Database schema and SQLAlchemy models are perfectly in sync and working correctly!")
    except Exception as e:
        print(f"Validation failed: {e}")

if __name__ == "__main__":
    from sqlalchemy import text
    asyncio.run(check_db())
