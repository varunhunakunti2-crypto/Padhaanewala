# Padhaanewala Education Technology Platform

Padhaanewala is a professional, scalable, database-driven education platform designed to help students discover colleges, search courses, compare colleges, check eligibility, find scholarships, take mock tests, and use an AI college predictor.

## Monorepo Structure

- `/frontend` - Next.js React application (Student-facing website, Admin Panel)
- `/backend` - Python FastAPI REST application
- `/database` - Database schemas, migrations (Alembic)
- `/docs` - Architecture and environment documentation
- `/scripts` - Utility scripts for deployment and data import

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
