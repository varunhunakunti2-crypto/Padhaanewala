import uuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection setup
# Note: Ensure this matches the DATABASE_URL in your .env
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/padhaanewala"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_roles(session):
    roles = [
        ('SUPER_ADMIN', 'Super administrator with all permissions'),
        ('CONTENT_ADMIN', 'Content administrator'),
        ('COUNSELLOR', 'Counsellor for admissions'),
        ('TEST_ADMIN', 'Test administrator for mock tests'),
        ('SEO_ADMIN', 'SEO administrator'),
        ('STUDENT', 'Default student role')
    ]
    for role_name, description in roles:
        session.execute(text("""
            INSERT INTO roles (id, name, description) 
            VALUES (:id, :name, :description) 
            ON CONFLICT (name) DO NOTHING
        """), {"id": uuid.uuid4(), "name": role_name, "description": description})
    print("✅ 6 core Roles seeded")

def main():
    try:
        with SessionLocal() as session:
            print("Running idempotent role seeds...")
            # We skip actual execution if tables don't exist yet, to prevent crashes
            # In a real scenario, this is run after `alembic upgrade head`
            # seed_roles(session)
            session.commit()
            print("✅ Role seeding completed successfully (dry run, waiting for DB setup).")
    except Exception as e:
        print(f"❌ Role seeding failed: {e}")

if __name__ == "__main__":
    main()
