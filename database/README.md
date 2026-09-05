# Database Directory

- `migrations/`: Alembic migrations.
- `seeds/`: Seed data for testing and initial setups.
- `schema/`: Raw SQL schemas and ERD diagrams.

## Database Setup & Migrations

To set up the database and run migrations, execute the following commands from the project root:

1. Create a local PostgreSQL database named `padhaanewala` (or as configured in `.env`).
2. Navigate to the `database` directory:
   ```bash
   cd database
   ```
3. Run Alembic migrations to create all tables:
   ```bash
   alembic upgrade head
   ```
